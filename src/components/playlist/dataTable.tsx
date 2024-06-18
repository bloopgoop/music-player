// @ts-nocheck
import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useUi } from "@/context/ui-provider";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  playlist: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  playlist,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [multiselect, setMultiselect] = useState(true);
  const { toast } = useToast();
  const { allPlaylists } = useUi();
  const table = useReactTable({
    data,
    columns,
    meta: { playlist: playlist, hoveredRow: hoveredRow, playlists: allPlaylists },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    defaultColumn: {
      size: 100,
      minSize: 20,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  });

  async function addSongToPlaylist(playlist: string, songId: number) {
    await window.playlists.addSongToPlaylist(playlist, songId);
  }

  return (
    <div className="relative rounded-md">
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm ml-1"
        />
        <div className="flex items-center space-x-2 pr-5">
          <Checkbox
            id="multi-select"
            checked={table.getColumn("select").getIsVisible()}
            onCheckedChange={(value) => {
              table.getColumn("select").toggleVisibility(!!value);
              setMultiselect(!!value);
            }}
          ></Checkbox>
          <Label htmlFor="multi-select">Select multiple</Label>
          {multiselect && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <DotsHorizontalIcon className="text-center ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem>Add to queue</DropdownMenuItem>
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Add to playlist</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {table.options.meta.playlists &&
                          table.options.meta.playlists.map((playlist) => {
                            if (playlist.name === "All songs") return null;
                            return (
                              <DropdownMenuItem
                                key={playlist.id}
                                onClick={() => {
                                  let count = 0;
                                  table
                                    .getFilteredSelectedRowModel()
                                    .rows.forEach((row) => {
                                      addSongToPlaylist(
                                        playlist.name,
                                        row.original.id
                                      );
                                      count++;
                                    });
                                  setRowSelection({});
                                  toast({
                                    className:
                                      "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
                                    variant: "default",
                                    title: "Success!",
                                    description: `Added ${count} songs to ${playlist.name}`,
                                  });
                                }}
                              >
                                <span>{playlist.name}</span>
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    onClick={() => {
                      let count = 0;
                      table
                        .getFilteredSelectedRowModel()
                        .rows.forEach((row) => {
                          window.playlists.deleteSongFromPlaylist(
                            playlist,
                            row.original.id
                          );
                          count++;
                        });
                      setRowSelection({});
                      toast({
                        className:
                          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
                        variant: "default",
                        title: "Success!",
                        description: `Deleted ${count} songs from ${playlist}`,
                      });
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Table style={{ tableLayout: "fixed" }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width:
                        header.id != "title" ? `${header.getSize()}px` : `100%`,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Toaster />
    </div>
  );
}
