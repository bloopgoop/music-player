import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Textarea } from "@/components/ui/textarea";
import Placeholder from "../assets/placeholder.png";
import { Playlist } from "@/db/models";
import { useNavigate } from "react-router-dom";
import Image from "@/components/image";
import { bufferToFile } from "@/lib/utils";

const PlaylistSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
});

const EditPlaylist = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  playlist,
}: {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playlist: Playlist;
}) => {
  const navigate = useNavigate();
  const imageFile = bufferToFile(playlist.image_buffer, playlist.image_mime);
  const [image, setImage] = useState<File | null>(imageFile);
  const imageRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof PlaylistSchema>>({
    resolver: zodResolver(PlaylistSchema),
    defaultValues: {
      name: playlist.name || "",
      description: playlist.description || "",
      image: imageFile,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length) {
      setImage(e.target.files[0]);
      form.setValue("image", e.target.files[0]);
    }
  };

  async function submit(values: z.infer<typeof PlaylistSchema>) {
    const filePath = values.image.path;
    console.log(values.name, values.description, filePath, playlist);
    const newPlaylistName = await window.playlists.editPlaylist({
      name: values.name,
      description: values.description,
      imageFilePath: filePath,
      imageBuffer: playlist.image_buffer,
      imageMime: playlist.image_mime,
      id: playlist.id,
    });
    setIsEditDialogOpen(false);
    navigate(`/playlist`, { state: { playlistName: newPlaylistName } });
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit playlist</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="editPlaylistForm"
            onSubmit={form.handleSubmit(submit)}
            className="w-4/5 flex flex-row gap-4 w-full"
          >
            <div
              className="w-[216px] flex-shrink-0"
              onClick={() => imageRef.current.click()}
            >
              {image ? (
                <AspectRatio ratio={1}>
                  <img
                    src={image ? URL.createObjectURL(image) : Placeholder}
                    className="rounded-lg object-cover h-full w-full hover:cursor-pointer hover:opacity-70 transition-opacity"
                    alt="Playlist"
                  />
                </AspectRatio>
              ) : (
                <Image
                  mime={playlist?.image_mime}
                  buffer={playlist?.image_buffer}
                  alt="cover"
                  className="object-cover h-full w-full hover:cursor-pointer hover:opacity-70 transition-opacity"
                />
              )}
            </div>
            <div className="flex flex-col h-full gap-4 flex-1 justify-between space-y-0">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="hidden space-y-0">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="text-primary hidden"
                        onChange={handleFileChange}
                        ref={imageRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Playlist name</FormLabel>
                    <FormControl>
                      <Input placeholder={playlist.name} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Playlist description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        placeholder={playlist.description || "Description"}
                        onChange={(e) =>
                          form.setValue("description", e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose className="px-4 rounded-lg">Close</DialogClose>
          <Button variant="default" type="submit" form="editPlaylistForm">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default EditPlaylist;
