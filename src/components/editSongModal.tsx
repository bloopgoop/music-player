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
import Placeholder from "../assets/placeholder.png";
import { Song } from "@/db/models";
import Image from "@/components/image";
import { bufferToFile } from "@/lib/utils";

const SongSchema = z.object({
  image: z.instanceof(File).optional(),
  title: z.string(),
  artist: z.string().optional(),
  album: z.string().optional(),
  genre: z.string().optional(),
  year: z.string().optional(),
});

const EditSongModal = ({
  song,
  isOpen,
  setIsOpen,
}: {
  song: Song;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const imageFile = bufferToFile(song.image_buffer, song.image_mime);
  const [image, setImage] = useState<File | null>(imageFile);
  const imageRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof SongSchema>>({
    resolver: zodResolver(SongSchema),
    defaultValues: {
      image: imageFile,
      title: song.title ? song.title : "",
      artist: song.artist ? song.artist : "",
      album: song.album ? song.album : "",
      genre: song.genre ? song.genre : "",
      year: song.year ? song.year : "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length) {
      setImage(e.target.files[0]);
      form.setValue("image", e.target.files[0]);
    }
  };

  async function submit(values: z.infer<typeof SongSchema>) {
    console.log(values);
    const filePath = values.image.path;
    const newSongName = await window.songs.editSong(song.id, {
      title: values.title,
      artist: values.artist,
      album: values.album,
      genre: values.genre,
      year: values.year,
      imageFilePath: filePath,
      imageBuffer: song.image_buffer,
      imageMime: song.image_mime,
      id: song.id,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit song {"(NOT WORKING)"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="editSongForm"
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-4 w-full items-center"
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
                    alt="Song"
                  />
                </AspectRatio>
              ) : (
                <Image
                  mime={song?.image_mime}
                  buffer={song?.image_buffer}
                  alt="cover"
                  className="object-cover h-full w-full hover:cursor-pointer hover:opacity-70 transition-opacity"
                />
              )}
            </div>

            <div className="flex flex-col h-full w-full gap-4 flex-1 justify-between space-y-0">
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
                        onChange={handleImageChange}
                        ref={imageRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song title</FormLabel>
                    <FormControl>
                      <Input placeholder={song.title} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder={song.artist} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="album"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album</FormLabel>
                    <FormControl>
                      <Input placeholder={song.album} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder={song.genre} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder={song.year} {...field} />
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
          <Button variant="default" type="submit" form="editSongForm">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default EditSongModal;
