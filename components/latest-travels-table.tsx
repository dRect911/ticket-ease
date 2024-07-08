"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getBusIdByTravelId,
  getPlateNumberByBusId,
  getRouteIdByTravelId,
  getRouteLocations,
  getLocationNameById,
  getLatestTravels,
} from "@/utils/supabase/queries";
import { Travel } from "@/types";

type Props = {
  latestTravels: Travel[];
};

const LatestTravelsTable = () => {
  const [travels, setTravels] = useState<Travel[]>([]);

  const [renderedTravels, setRenderedTravels] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const latestTravels = await getLatestTravels(5);
      setTravels(latestTravels);
      const travelDetails = await Promise.all(
        latestTravels.map(async (travel) => {
          const busId = await getBusIdByTravelId(travel.travel_id);
          const plateNumber = await getPlateNumberByBusId(busId as string);
          const routeId = await getRouteIdByTravelId(travel.travel_id);
          const locations = await getRouteLocations(routeId as string);

          // Extract departure and arrival locations from locations
          const departureId = locations?.startLocationId;
          const arrivalId = locations?.endLocationId;

          const departureName = await getLocationNameById(
            departureId as string
          );
          const arrivalName = await getLocationNameById(arrivalId as string);

          return {
            ...travel,
            plateNumber,
            departureName,
            arrivalName,
          };
        })
      );
      setRenderedTravels(travelDetails);
    };

    fetchData();
  }, [travels, renderedTravels]);

  const renderTravelRow = async ({ travel }: { travel: Travel }) => {
    const busId = await getBusIdByTravelId(travel.travel_id);
    const plateNumber = await getPlateNumberByBusId(busId as string);
    const routeId = await getRouteIdByTravelId(travel.travel_id);
    const locations = await getRouteLocations(routeId as string);
    // ... (further processing of locations data if needed)

    // Extract departure and arrival locations from locations
    const departureId = locations?.startLocationId; // Assuming first location is departure
    const arrivalId = locations?.endLocationId; // Assuming last location is arrival

    const departureName = await getLocationNameById(departureId as string);
    const arrivalName = await getLocationNameById(arrivalId as string);

    // ... (further processing of data if needed)

    return (
      <TableRow key={travel.travel_id}>
        <TableCell>
          <div className="font-medium">{departureName}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{arrivalName}</div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{plateNumber}</div>
        </TableCell>
        <TableCell className="text-right">
          <div className="font-medium">{"0"}</div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Travels</CardTitle>
          <CardDescription>Recent travels.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="admin-dashboard/travels">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="">Date</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead className="">Arrival</TableHead>
              <TableHead className="">Bus</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderedTravels.length > 0 ? (
              renderedTravels.map((travel) => (
                <TableRow key={travel.travel_id}>
                  <TableCell>
                    <div className="font-medium">
                      {new Date(travel.travel_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{travel.departureName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{travel.arrivalName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{travel.plateNumber}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{travel.price}</div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No recent travels found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LatestTravelsTable;
