"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react";
import { Booking } from "@/types";
import {
  getAllBookings,
  getProfileById,
  getTicketById,
  getTravelById,
} from "@/utils/supabase/queries";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BookingDetails extends Omit<Booking, 'booking_date'> {
  price: number;
  booking_date: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  bookings: Booking[];
}

const chartConfig = {
  views: {
    label: "Revenue & Bookings",
  },
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  bookings: {
    label: "Bookings",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function RevenueChart({ bookings }: RevenueChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("revenue");
  const [detailedBookings, setDetailedBookings] = React.useState<BookingDetails[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch detailed booking data with prices
  React.useEffect(() => {
    const fetchDetailedBookings = async () => {
      setLoading(true);
      try {
        const bookingsWithDetails = await Promise.all(
          bookings.map(async (booking) => {
            const ticket = await getTicketById(booking.ticket_id);
            const travel = ticket ? await getTravelById(ticket.travel_id) : null;
            
            return {
              ...booking,
              price: travel?.price || 0,
              booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString() : new Date().toISOString(),
            };
          })
        );
        setDetailedBookings(bookingsWithDetails);
      } catch (error) {
        console.error("Error fetching detailed bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedBookings();
  }, [bookings]);

  const chartData = useMemo(() => {
    if (!detailedBookings.length) return [];

    // Get last 3 months
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // Filter bookings from last 3 months
    const recentBookings = detailedBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= threeMonthsAgo;
    });

    // Group by day for more granular data
    const dailyData: Record<string, { revenue: number; bookings: number }> = {};

    recentBookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date);
      const dateKey = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { revenue: 0, bookings: 0 };
      }

      dailyData[dateKey].revenue += booking.price;
      dailyData[dateKey].bookings += 1;
    });

    // Fill in missing days with zero values to create continuous data
    const continuousData: Array<{ date: string; revenue: number; bookings: number }> = [];
    const currentDate = new Date(threeMonthsAgo);
    
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingData = dailyData[dateKey];
      
      continuousData.push({
        date: dateKey,
        revenue: existingData ? existingData.revenue : 0,
        bookings: existingData ? existingData.bookings : 0,
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return continuousData;
  }, [detailedBookings]);

  const total = useMemo(() => ({
    revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    bookings: chartData.reduce((acc, curr) => acc + curr.bookings, 0),
  }), [chartData]);

  const averageRevenue = total.bookings > 0 ? Math.round(total.revenue / total.bookings) : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Chart
          </CardTitle>
          <CardDescription>Loading revenue data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Chart - Interactive
          </CardTitle>
          <CardDescription>
            Showing daily revenue and bookings for the last 3 months ({chartData.length} days)
          </CardDescription>
        </div>
        <div className="flex">
          {["revenue", "bookings"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  {chart === "revenue" ? <DollarSign className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {chart === "revenue" 
                    ? `${total[key as keyof typeof total].toLocaleString()} XOF`
                    : total[key as keyof typeof total].toLocaleString()
                  }
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={50}
                  fontSize={12}
                  stroke="#888888"
                  interval="preserveStartEnd"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  stroke="#888888"
                  tickFormatter={(value) => {
                    if (activeChart === "revenue") {
                      return `${value.toLocaleString()} XOF`;
                    }
                    return value.toLocaleString();
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[200px]"
                      nameKey={activeChart === "revenue" ? "Revenue" : "Bookings"}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke={activeChart === "revenue" ? "#10b981" : "#3b82f6"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: activeChart === "revenue" ? "#10b981" : "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No Revenue Data</div>
              <p className="text-sm">No booking data available for the last 3 months</p>
            </div>
          </div>
        )}
        
        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {total.revenue.toLocaleString()} XOF
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {total.bookings}
            </div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {averageRevenue.toLocaleString()} XOF
            </div>
            <div className="text-sm text-muted-foreground">Avg. per Booking</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 