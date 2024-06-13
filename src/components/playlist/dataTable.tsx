import { useState, useEffect } from "react";
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
import { Playlist } from "@/db/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { set } from "react-hook-form";

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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [multiselect, setMultiselect] = useState(true);
  const table = useReactTable({
    data,
    columns,
    meta: { playlist: playlist, hoveredRow: hoveredRow, playlists: playlists },
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

  let res;

  useEffect(() => {
    async function getPlaylists() {
      const playlists = await window.playlists.getAllPlaylists();
      setPlaylists(playlists);
    }
    getPlaylists();
  }, []);

  // webhook to update playlists
  useEffect(() => {
    window.playlists.recieveAllPlaylists((res: Playlist[]) =>
      setPlaylists(res)
    );
  }, [res]);

  async function addSongToPlaylist(playlist: string, songId: number) {
    await window.playlists.addSongToPlaylist(playlist, songId);
  }

  return (
    <div className="rounded-md">
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
                                  table
                                    .getFilteredSelectedRowModel()
                                    .rows.forEach((row) => {
                                      console.log(row);
                                      addSongToPlaylist(
                                        playlist.name,
                                        Number(row.id) + 1
                                      );
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
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Table style={{ tableLayout: "fixed"}}>
        <TableHeader >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                console.log(header)
                console.log(header.getSize())
                return (
                  <TableHead
                    {...{
                      key: header.id,
                      colSpan: header.colSpan,
                      style: {
                        width: header.id != "title" ? `${header.getSize()}px` : `100%`,
                      },
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
    </div>
  );
}
