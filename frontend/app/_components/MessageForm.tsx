"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FilePreview } from "./FilePreview";

interface MessageFormProps {
  onSubmit?: (message: string, files: File[]) => void;
  isLoading?: boolean;
}

export function MessageForm({ onSubmit, isLoading }: MessageFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSchema = z.object({
    message: z.string().min(1, {
      message: "メッセージを入力してください",
    }),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
    mode: "onSubmit",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.log(selectedFiles);
    if (selectedFiles.length === 0) return;
    const nonPdfFiles = selectedFiles.filter(
      (file) => file.type !== "application/pdf"
    );
    if (nonPdfFiles.length > 0) {
      toast.error("無効なファイル形式です");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast.error("ファイルのアップロードに失敗しました");
        return;
      }
      toast.success("ファイルのアップロードに成功しました");

      setFiles((prev) => [...prev, ...selectedFiles]);
    } catch (error) {
      toast.error("ファイルのアップロードに失敗しました");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
    toast.success("ファイルを削除しました");
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    if (onSubmit) {
      onSubmit(values.message, files);
    }
    reset();
    setFiles([]);
  };

  return (
    <div className="w-full">
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemoveFile(file)}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex gap-2 border rounded-md overflow-hidden bg-gray-50">
          <Input
            ref={fileInputRef}
            onChange={handleFileChange}
            type="file"
            accept=".pdf"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-none"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
          >
            <Paperclip />
          </Button>
          <Input
            {...register("message")}
            placeholder={
              isUploading ? "アップロード中..." : "メッセージを送信..."
            }
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isUploading || isLoading}
          />
          <Button type="submit" size="icon" disabled={isUploading || isLoading}>
            <Send />
          </Button>
        </div>
        {errors.message && (
          <p role="alert" className="text-xs text-red-500 mt-1 ml-1">
            {errors.message.message}
          </p>
        )}
      </form>
    </div>
  );
}
