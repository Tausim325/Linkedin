
import React, { useContext, useEffect, useState } from "react";
import Nav from "../Componenets/Nav";
import axios from "axios";
import { authDataContext } from "../Context/AuthContext";

function Network() {
  const { serverUrl } = useContext(authDataContext);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const handleGetRequests = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/connection/requests`,
        { withCredentials: true }
      );

      console.log("Connection requests:", result.data);
      setConnections(result.data);
    } catch (error) {
      console.error(
        "Get requests error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetRequests();
  }, [serverUrl]);

  const handleRequestAction = async (connectionId, action) => {
    try {
      setProcessingId(connectionId);

      await axios.put(
        `${serverUrl}/api/connection/${action}/${connectionId}`,
        {},
        { withCredentials: true }
      );

      setConnections((prev) =>
        prev.filter((connection) => connection._id !== connectionId)
      );
    } catch (error) {
      console.error(
        `${action} request error:`,
        error.response?.data || error.message
      );
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f0efe7] pt-[100px]">
      <Nav />

      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold">Network</h1>

        <h2 className="mt-5 text-xl font-semibold">
          Invitations ({connections.length})
        </h2>

        {loading ? (
          <p className="mt-4 text-gray-500">
            Loading invitations...
          </p>
        ) : connections.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No new invitations.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {connections.map((connection) => {
              const sender = connection.sender;

              const fullName = sender
                ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim()
                : "";

              return (
                <div
                  key={connection._id}
                  className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        sender?.profileImage ||
                        "https://placehold.co/60x60?text=User"
                      }
                      alt={fullName || "User"}
                      className="h-14 w-14 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="font-semibold">
                        {fullName || sender?.userName || "Unknown User"}
                      </h3>

                      {sender?.userName && (
                        <p className="text-sm text-gray-500">
                          @{sender.userName}
                        </p>
                      )}

                      {sender?.headline && (
                        <p className="text-sm text-gray-500">
                          {sender.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleRequestAction(connection._id, "accept")
                      }
                      disabled={processingId === connection._id}
                      className="rounded-full bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {processingId === connection._id
                        ? "Please wait..."
                        : "Accept"}
                    </button>

                    <button
                      onClick={() =>
                        handleRequestAction(connection._id, "reject")
                      }
                      disabled={processingId === connection._id}
                      className="rounded-full border border-gray-300 px-4 py-2 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Network;
