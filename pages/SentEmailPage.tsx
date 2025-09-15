"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowLeft } from "lucide-react";
import EmailSummaryAndReply from "@/components/inbox/EmailSummaryAndReply";

const SentEmailPage = () => {
  const { emailId } = useParams<{ emailId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchEmail = async () => {
      if (!emailId) {
        setError("No email ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching sent email with ID: ${emailId}`);
        // Use the dedicated sent email endpoint
        const res = await axios.get(
          `http://localhost:5000/api/emails/sent/${emailId}`,
          {
            withCredentials: true,
            timeout: 15000, // 15 second timeout
            params: retryCount > 0 ? { refresh: true } : {}, // Add cache-busting on retry
          }
        );
        console.log("Received sent email data:", res.data);
        setEmail(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching sent email:", err);

        if (err.code === "ECONNABORTED") {
          setError("Request timed out. Please try again.");
        } else if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          // Redirect to login page after session expiry
          setTimeout(() => navigate("/"), 2000);
        } else if (err.response?.status === 404) {
          setError("Email not found. It may have been deleted or moved.");
        } else {
          setError(
            `Failed to load email: ${err.response?.data?.error || err.message}`
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId, navigate, retryCount]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  const goBack = () => {
    navigate("/sent");
  };

  return (
    <AppShell>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sent
          </Button>

          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-8">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p className="font-medium mb-2">Error</p>
            <p className="text-sm">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={handleRetry}
              size="sm"
            >
              Try Again
            </Button>
          </div>
        ) : !email ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
            <p>Email not found or still loading.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={handleRetry}
              size="sm"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <EmailSummaryAndReply email={email} />
        )}
      </div>
    </AppShell>
  );
};

export default SentEmailPage;
