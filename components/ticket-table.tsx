"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Ticket as TicketIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bus, Ticket, Travel } from "@/types";
import {
  deleteTicket,
  getAllTickets,
  getTicketById,
  getTravelById,
  getBusIdByTravelId,
  getBusById,
  getRouteLocations,
  getRouteIdByTravelId,
  getLocationNameById,
} from "@/utils/supabase/queries";
import TicketForm from "@/components/ticket-form";
import { useToast } from "./ui/use-toast";
import useSWR from "swr";
import tickets from "../app/admin-dashboard/tickets/page";

interface TicketDetails extends Ticket {
  bus_plate: string;
  departure_name: string;
  arrival_name: string;
  price: number;
  date: Date;
}

const columns: ColumnDef<TicketDetails>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "departure_name",
    header: "Departure",
    cell: ({ row }) => {
      return (
        <div className="text-medium text-sky-600">
          {row.getValue("departure_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "arrival_name",
    header: "Arrival",
    cell: ({ row }) => {
      return (
        <div className="text-medium text-orange-600">
          {row.getValue("arrival_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div>
          {new Date(ticket.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "bus_plate",
    header: "Bus Plate Number",
    cell: ({ row }) => <div>{row.getValue("bus_plate")}</div>,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-medium text-emerald-600">{`${row.getValue(
        "price"
      )} XOF`}</div>
    ),
  },
  {
    accessorKey: "seat_number",
    header: "Seat Number",
    cell: ({ row }) => <div>{row.getValue("seat_number")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      if (row.getValue("status") === "available") {
        return (
          <div>
            {" "}
            <span
              className={`rounded-full py-0.5 px-2 bg-green-200 text-green-700 font-medium`}
            >
              {row.getValue("status")}
            </span>{" "}
          </div>
        );
      } else if (row.getValue("status") === "booked") {
        return (
          <div>
            {" "}
            <span
              className={`rounded-full py-0.5 px-2 bg-pink-200 text-pink-700 font-medium`}
            >
              {row.getValue("status")}
            </span>{" "}
          </div>
        );
      }
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => console.log("Edit ticket", ticket)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const deleted = await deleteTicket(ticket.ticket_id);
                // Handle deletion logic here
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TicketTable() {
  const { toast } = useToast();
  const [pageIndex, setPageIndex] = React.useState(1); // Track current page
  const [pageSize, setPageSize] = React.useState(10); // Track page size
  const [cachedPages, setCachedPages] = React.useState<{
    [key: number]: TicketDetails[];
  }>({});
  // Fetch paginated tickets based on page and limit
  const { data: tickets, error } = useSWR(
    `tickets-page-${pageIndex}`, // Use a unique key for each page
    () => getAllTickets({ page: pageIndex, limit: pageSize }),
    { keepPreviousData: true } // Keeps the previous page’s data while loading the new page
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<TicketDetails[]>([]);

  const fetchData = async (tickets: Ticket[], page: number) => {
    setLoading(true);

    // Check if data for this page is already cached
    if (cachedPages[page]) {
      setData(cachedPages[page]);
      setLoading(false);
      return;
    }
    // const tickets = await getAllTickets();
    let ticketsWithDetails: TicketDetails[] = [];

    if (tickets) {
      ticketsWithDetails = await Promise.all(
        tickets.map(async (ticket) => {
          const travelDetails = (await getTravelById(
            ticket.travel_id
          )) as Travel;
          const busDetails = (await getBusById(
            (await getBusIdByTravelId(travelDetails.travel_id)) as string
          )) as Bus;
          const bus_plate = busDetails.plate_number;
          const locations = await getRouteLocations(
            (await getRouteIdByTravelId(travelDetails.travel_id)) as string
          );

          const price = travelDetails.price;
          const date = travelDetails.travel_date;
          // Extract departure and arrival locations from locations
          const departureId = locations?.startLocationId;
          const arrivalId = locations?.endLocationId;

          const departure_name = (await getLocationNameById(
            departureId as string
          )) as string;
          const arrival_name = (await getLocationNameById(
            arrivalId as string
          )) as string;
          return {
            ...ticket,
            departure_name,
            arrival_name,
            price,
            bus_plate,
            date,
          };
        })
      );
    }
    setCachedPages((prevCache) => ({
      ...prevCache,
      [page]: ticketsWithDetails, // Cache this page's data
    }));

    setData(ticketsWithDetails);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchData(tickets as Ticket[], pageIndex);
  }, [pageIndex]);

  // Memoize processed ticket data
  /* const memoizedTicketsWithDetails = React.useMemo(() => {
  // Only re-process data when tickets change
  fetchData(tickets as Ticket[]);
}, [tickets]); */

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true, // enable manual pagination
    pageCount: data.length < pageSize ? pageIndex : undefined, // Set page count based on data length
  });

  const handleNextPage = () => setPageIndex((prev) => prev + 1);
  const handlePreviousPage = () =>
    setPageIndex((prev) => Math.max(prev - 1, 1));

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error loading tickets.</div>;
  if (!tickets) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter names..."
          value={
            (table
              .getColumn("start_location_name")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("start_location_name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    fetchData(tickets, pageIndex);
                  }}
                >
                  <RefreshCw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reload</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* <TicketForm /> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pageIndex === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={data.length < pageSize}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
