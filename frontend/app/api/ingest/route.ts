import { indexConfig } from "@/app/_constants/graphConfigs";
import { langGraphServerClient } from "@/app/_lib/langgraph-server";
import { processPDF } from "@/app/_lib/pdf";
import { PDFDocument } from "@/app/_types/graphTypes";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["application/pdf"];

export async function POST(req: NextRequest) {
  try {
    if (!process.env.LANGGRAPH_INGESTION_ASSISTANT_ID) {
      return new NextResponse("LANGGRAPH_INGESTION_ASSISTANT_ID is not set", {
        status: 500,
      });
    }
    const formData = await req.formData();
    const files: File[] = [];

    const fileEntries = formData.getAll("files");
    for (const value of fileEntries) {
      if (value instanceof File) {
        files.push(value);
      }
    }
    if (files.length === 0) {
      return new NextResponse("No files uploaded", { status: 400 });
    }

    if (files.length > 5) {
      return new NextResponse("Too many files. Maximum 5 files allowed.", {
        status: 400,
      });
    }

    const invalidFiles = files.filter((file) => {
      !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE;
    });

    if (invalidFiles.length > 0) {
      return new NextResponse(
        "Only PDF files are allowed and file size must be less than 10MB",
        { status: 400 }
      );
    }

    const allDocs: PDFDocument[] = [];
    for (const file of files) {
      try {
        const docs = await processPDF(file);
        allDocs.push(...docs);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }

    const thread = await langGraphServerClient.createThread();

    const run = await langGraphServerClient.client.runs.wait(
      thread.thread_id,
      process.env.LANGGRAPH_INGESTION_ASSISTANT_ID,
      {
        input: {
          docs: allDocs,
        },
        config: {
          configurable: {
            ...indexConfig,
          },
        },
      }
    );
    return NextResponse.json({
      message: "Ingestion completed",
      threadId: thread.thread_id,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
