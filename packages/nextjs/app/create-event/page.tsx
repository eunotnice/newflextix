"use client";

import { useState } from "react";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUri: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const { writeAsync: createEvent, isMining } = useScaffoldContractWrite({
    contractName: "EventTicketing",
    functionName: "createEvent",
    args: [
      formData.name,
      formData.description,
      formData.imageUri,
      BigInt(0), // Will be calculated from form data
      BigInt(0), // Will be calculated from form data
    ],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert date/time to timestamps
      const startTimestamp = Math.floor(new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(`${formData.endDate}T${formData.endTime}`).getTime() / 1000);

      if (startTimestamp <= Date.now() / 1000) {
        notification.error("Start time must be in the future");
        return;
      }

      if (endTimestamp <= startTimestamp) {
        notification.error("End time must be after start time");
        return;
      }

      await createEvent({
        args: [
          formData.name,
          formData.description,
          formData.imageUri,
          BigInt(startTimestamp),
          BigInt(endTimestamp),
        ],
      });

      notification.success("Event created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        imageUri: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      notification.error("Failed to create event");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Create New Event</h1>
        <p className="text-lg text-gray-600">Set up your event and start selling NFT tickets</p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Event Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter event name"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                className="textarea textarea-bordered h-24"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Event Image URL</span>
              </label>
              <input
                type="url"
                name="imageUri"
                value={formData.imageUri}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Start Date</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Start Time</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">End Date</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">End Time</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div className="form-control mt-8">
              <button
                type="submit"
                className={`btn btn-primary btn-lg w-full ${isMining ? "loading" : ""}`}
                disabled={isMining}
              >
                {isMining ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
