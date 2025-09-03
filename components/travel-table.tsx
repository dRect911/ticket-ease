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
  Route as RouteIcon,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Bus as BusIcon,
  Users,
  DollarSign,
  Clock,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, Route, Travel } from "@/types";
import {
  deleteRoute,
  getAllRoutes,
  getAllTravels,
  getBusById,
  getBusIdByTravelId,
  getLocationNameById,
  getPlateNumberByBusId,
  getRouteIdByTravelId,
  getRouteLocations,
} from "@/utils/supabase/queries";
import RouteForm from "@/components/route-form";
import { useToast } from "./ui/use-toast";
import TravelForm from "./travel-form";
import EditTravelForm from "./edit-travel-form";
import DeleteTravelModal from "./delete-travel-modal";
import TravelDetailsModal from "./travel-details-modal";
import { useTravels, useBuses, useLocations, useRoutes } from "@/hooks/useCachedData";
import { cacheUtils } from "@/utils/cache-utils";

interface TravelDetails extends Travel {
  bus_plate: string;
  places_amount: number;
  departure_name: string;
  arrival_name: string;
}

export default function TravelTable() {
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<TravelDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedTravel, setSelectedTravel] = React.useState<TravelDetails | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedTravelForDetails, setSelectedTravelForDetails] = React.useState<{travel: Travel, details: any} | null>(null);

  // Use SWR for cached data
  const { data: travels, error: travelsError, isLoading: travelsLoading } = useTravels();
  const { data: buses } = useBuses();
  const { data: locations } = useLocations();
  const { data: routes } = useRoutes();

  // Process travel data with cached lookups
  const fetchData = React.useCallback(async () => {
    if (!travels || !buses || !locations || !routes) {
      console.log("[TravelTable] Waiting for dependencies to load...");
      return;
    }

    console.log("[TravelTable] Processing travels with cached data");
    setLoading(true);

    try {
    const travelWithDetails = await Promise.all(
        travels.map(async (travel, index) => {
          try {
            console.log(`[TravelTable] Processing travel ${index + 1}/${travels.length}: ${travel.travel_id}`);

            // Get bus information with cached data
            let bus_plate = "N/A";
            let places_amount = 0;
            
            try {
              const busId = await getBusIdByTravelId(travel.travel_id);
              if (busId) {
                const bus = buses.find(b => b.bus_id === busId) || (await getBusById(busId));
                bus_plate = bus?.plate_number || "N/A";
                places_amount = bus?.capacity || 0;
              }
            } catch (error) {
              console.warn(`[TravelTable] Error fetching bus for travel ${travel.travel_id}:`, error);
            }

            // Get route and location information with cached data
            let departure_name = "Unknown";
            let arrival_name = "Unknown";

            try {
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              if (routeId) {
                const routeLocations = await getRouteLocations(routeId);
                if (routeLocations) {
                  // Get departure location
                  if (routeLocations.startLocationId) {
                    const departureLocation = locations.find(l => l.location_id === routeLocations.startLocationId);
                    if (departureLocation) {
                      departure_name = departureLocation.location_name;
                    } else {
                      const locationName = await getLocationNameById(routeLocations.startLocationId);
                      departure_name = locationName || "Unknown";
                    }
                  }
                  
                  // Get arrival location
                  if (routeLocations.endLocationId) {
                    const arrivalLocation = locations.find(l => l.location_id === routeLocations.endLocationId);
                    if (arrivalLocation) {
                      arrival_name = arrivalLocation.location_name;
                    } else {
                      const locationName = await getLocationNameById(routeLocations.endLocationId);
                      arrival_name = locationName || "Unknown";
                    }
                  }
                }
              }
            } catch (error) {
              console.warn(`[TravelTable] Error fetching route/location for travel ${travel.travel_id}:`, error);
            }

            const result = {
          ...travel,
          bus_plate,
          departure_name,
          arrival_name,
          places_amount,
        };

            console.log(`[TravelTable] Successfully processed travel ${travel.travel_id}`);
            return result;
          } catch (error) {
            console.error(`[TravelTable] Error processing travel ${travel.travel_id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results
      const validTravels = travelWithDetails.filter(travel => travel !== null);
      console.log(`[TravelTable] Successfully processed ${validTravels.length}/${travels.length} travels`);
      
      setData(validTravels);
    } catch (error) {
      console.error("[TravelTable] Critical error in fetchData:", error);
      toast({
        title: "Error",
        description: "Failed to load travel details",
        variant: "destructive",
      });
    } finally {
    setLoading(false);
    }
  }, [travels, buses, locations, routes, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<TravelDetails>[] = [
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
      id: "travel_info",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Travel Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const travel = row.original;
        const travelDate = new Date(travel.travel_date);
        const isUpcoming = travelDate > new Date();
        
        return (
          <div className="space-y-2">
            {/* Primary info - Date and Status */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {travelDate.toLocaleDateString("en-US", {
                  weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
              </span>
              <Badge variant={isUpcoming ? "default" : "secondary"} className="text-xs">
                {isUpcoming ? "Upcoming" : "Past"}
              </Badge>
            </div>
            
            {/* Secondary info - Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {travelDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      },
      accessorFn: (row) => row.travel_date,
      sortingFn: "datetime",
    },
    {
      id: "route_info",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Route
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const travel = row.original;
        return (
          <div className="space-y-2">
            {/* Primary info - Route */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-700">{travel.departure_name}</span>
              </div>
              <div className="flex-1 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-orange-700">{travel.arrival_name}</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Secondary info - Distance estimate */}
            <div className="text-xs text-muted-foreground text-center">
              <RouteIcon className="h-3 w-3 inline mr-1" />
              Direct route
            </div>
          </div>
        );
      },
      accessorFn: (row) => `${row.departure_name} - ${row.arrival_name}`,
    },
    {
      id: "bus_info",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          <BusIcon className="mr-2 h-4 w-4" />
          Bus Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const travel = row.original;
        return (
          <div className="space-y-2">
            {/* Primary info - Bus plate */}
            <div className="flex items-center gap-2">
              <BusIcon className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="font-mono font-semibold">
                {travel.bus_plate}
              </Badge>
            </div>
            
            {/* Secondary info - Capacity */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{travel.places_amount} seats</span>
            </div>
          </div>
        );
      },
      accessorFn: (row) => row.bus_plate,
    },
    {
      id: "price_info",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const travel = row.original;
        return (
          <div className="text-right space-y-1">
            {/* Primary info - Price */}
            <div className="text-lg font-bold text-green-600">
              {travel.price.toLocaleString()} XOF
            </div>
            
            {/* Secondary info - Per seat */}
            <div className="text-xs text-muted-foreground">
              per seat
            </div>
          </div>
        );
      },
      accessorFn: (row) => row.price,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const travel = row.original;
        return (
          <div className="flex items-center gap-1">
            {/* Quick action buttons */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                  onClick={() => {
                    setSelectedTravelForDetails({
                      travel: travel,
                      details: {
                        bus_plate: travel.bus_plate,
                        departure_name: travel.departure_name,
                        arrival_name: travel.arrival_name,
                        places_amount: travel.places_amount,
                      }
                    });
                    setDetailsModalOpen(true);
                  }}
                >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                  <EditTravelForm
                    travelId={travel.travel_id}
                      onSuccess={() => {
                        fetchData();
                        cacheUtils.invalidateTravels();
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Edit Travel</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  onClick={() => {
                    setSelectedTravel(travel);
                    setDeleteModalOpen(true);
                  }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Travel</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More actions dropdown for additional options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RouteIcon className="mr-2 h-4 w-4" />
                  View Route Map
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  View Bookings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Duplicate Travel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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
    },
  });

  // Loading state with skeleton
  const renderLoadingSkeleton = () => (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          {/* Table rows skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-dashed">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-px w-8" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-24 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state if SWR is loading or processing data
  if (travelsLoading || loading || !travels) {
    return renderLoadingSkeleton();
  }

  // Show error state
  if (travelsError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <RefreshCw className="h-5 w-5" />
            Error Loading Travels
          </CardTitle>
          <CardDescription>
            Failed to load travel data. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              cacheUtils.invalidateTravels();
              fetchData();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BusIcon className="h-6 w-6" />
              Travel Management
            </CardTitle>
            <CardDescription>
              Manage travel schedules, routes, and pricing. {data.length} travels available.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cacheUtils.invalidateTravels();
                fetchData();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <TravelForm onSuccess={() => {
              fetchData();
              cacheUtils.invalidateTravels();
            }} />
          </div>
        </div>

        {/* Enhanced filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
        <Input
              placeholder="Search routes, buses, or destinations..."
          value={
            (table
                  .getColumn("route_info")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
                table.getColumn("route_info")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
          </div>
          
          <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Columns
              </Button>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                        {column.id.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                    );
                  })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="font-semibold">
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
                    className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BusIcon className="h-8 w-8" />
                      <div className="text-lg font-medium">No travels found</div>
                      <div className="text-sm">Create your first travel to get started</div>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

        {/* Enhanced pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </span>
            <span>•</span>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
        </div>
          
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      </CardContent>

      {/* Modals */}
      <DeleteTravelModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTravel(null);
        }}
        travelId={selectedTravel?.travel_id || ""}
        travelDetails={{
          departure_name: selectedTravel?.departure_name || "",
          arrival_name: selectedTravel?.arrival_name || "",
          travel_date: selectedTravel?.travel_date ? String(selectedTravel.travel_date) : "",
          bus_plate: selectedTravel?.bus_plate || "",
        }}
        onSuccess={() => {
          fetchData();
          cacheUtils.invalidateTravels();
          setDeleteModalOpen(false);
          setSelectedTravel(null);
          toast({
            title: "Success",
            description: "Travel deleted successfully",
          });
        }}
      />
      
      {selectedTravelForDetails && (
        <TravelDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTravelForDetails(null);
          }}
          travel={selectedTravelForDetails.travel}
          travelDetails={selectedTravelForDetails.details}
        />
      )}
    </Card>
  );
}

