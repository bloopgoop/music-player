"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PinBottomIcon, ArchiveIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const DropboxSchema = z.object({
  files: z.instanceof(FileList),
});

const Dropbox = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const form = useForm<z.infer<typeof DropboxSchema>>({
    resolver: zodResolver(DropboxSchema),
    defaultValues: {
      files: null,
    },
  });
  const dropboxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length) {
      setFiles(e.target.files);
      form.setValue("files", e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropboxRef.current) {
      dropboxRef.current.style.backgroundColor = "lightgray";
      dropboxRef.current.style.boxShadow =
        "inset 0px 0px 10px 5px rgba(0, 0, 0, 0.2)";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropboxRef.current) {
      dropboxRef.current.style.backgroundColor = "white";
      dropboxRef.current.style.boxShadow = "none";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropboxRef.current) {
      dropboxRef.current.style.backgroundColor = "white";
      dropboxRef.current.style.boxShadow = "none";
    }
    if (!e.dataTransfer.files) {
      console.log("No files selected");
      return;
    }
    // check file type
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const fileType = e.dataTransfer.files[i].type;
      if (fileType !== "audio/mpeg") {
        console.log(fileType);
        console.log("Only mp3 files are allowed");
        return;
      }
    }
    setFiles(e.dataTransfer.files); // asynchronous
    fileInputRef.current.files = e.dataTransfer.files;
  };

  async function registerSongs(values: z.infer<typeof DropboxSchema>) {
    // Get file paths from FileList object
    const filePaths = Object.keys(values.files).map(
      (key) => values.files.item(Number(key)).path
    );
    await window.songs.registerSongs({
      filePaths: filePaths, // send file paths to main process
    });
  }
  return (
    <div className="p-3 h-full w-full flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold mb-3">Register song(s)</h1>
      <div id="dropbox" className="flex-1 w-full relative">
        <div
          className="absolute p-2 w-4/5 h-4/5 bg-muted border-2 border-dashed border-gray-300 rounded-lg inset-0 m-auto"
          ref={dropboxRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="dropzone"
        >
          {files ? (
            <div className="flex flex-col items-center justify-center h-full overflow-hidden">
              <ArchiveIcon className="w-12 h-12 text-primary" />
              <p className="text-primary">Files selected</p>
              <p className="text-primary">{files.length} files</p>
              <div className="h-1/2 overflow-auto">
                {Array.from(files).map((file) => (
                  <p key={file.name} className="text-primary">
                    {file.name}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <PinBottomIcon className="w-12 h-12 text-primary" />
              <p className="text-primary">Drag and drop files here</p>
            </div>
          )}
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(registerSongs)}
          className="space-y-4 w-4/5"
        >
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio</FormLabel>
                <FormControl>
                  <Input
                    required
                    multiple
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*"
                    ref={fileInputRef}
                    className="text-primary"
                  />
                </FormControl>
                <FormDescription>This is the audio file</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant="default" type="submit" className="float-right">
            Download
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default Dropbox;
