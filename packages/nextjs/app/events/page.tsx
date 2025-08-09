"use client";

import { useState, useEffect } from "react";
import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";

interface Event {
  eventId: bigint;
  name: string;
  description: string;
  imageUri: string;
  organizer: string;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
  hasEnded: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: eventTicketing } = useScaffoldContract({
    contractName: "EventTicketing",
  });

  // This would need to be implemented to fetch all events
  // For now, we'll show a placeholder
  useEffect(() => {
    const fetchEvents = async () => {
      // In a real implementation, you'd fetch events from the contract
      // For now, we'll use mock data
      const mockEvents: Event[] = [
        {
          eventId: BigInt(0),
          name: "Blockchain Conference 2024",
          description: "The premier blockchain conference featuring industry leaders and innovators.",
          imageUri: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          organizer: "0x1234567890123456789012345678901234567890",
          startTime: BigInt(Date.now() / 1000 + 86400), // Tomorrow
          endTime: BigInt(Date.now() / 1000 + 172800), // Day after tomorrow
          isActive: true,
          hasEnded: false,
        },
        {
          eventId: BigInt(1),
          name: "NFT Art Exhibition",
          description: "Discover the latest in digital art and NFT collections from emerging artists.",
          imageUri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
          organizer: "0x2345678901234567890123456789012345678901",
          startTime: BigInt(Date.now() / 1000 + 259200), // 3 days from now
          endTime: BigInt(Date.now() / 1000 + 345600), // 4 days from now
          isActive: true,
          hasEnded: false,
        },
      ];
      
      setEvents(mockEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
        <p className="text-lg text-gray-600">Discover and purchase tickets for amazing events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.eventId.toString()} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={event.imageUri}
                alt={event.name}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{event.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Start:</span> {formatDate(event.startTime)}
                </div>
                <div>
                  <span className="font-semibold">End:</span> {formatDate(event.endTime)}
                </div>
                <div>
                  <span className="font-semibold">Organizer:</span>
                  <span className="font-mono text-xs ml-1">
                    {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="card-actions justify-end mt-4">
                <div className="badge badge-primary">
                  {event.isActive ? "Active" : "Inactive"}
                </div>
                <button className="btn btn-primary btn-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-gray-600">Check back later for upcoming events!</p>
        </div>
      )}
    </div>
  );
};

export default Events;
