import { useParams, useLocation } from "react-router-dom";
import EmailSummaryAndReply from "@/components/inbox/EmailSummaryAndReply";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EmailSummaryPage = () => {
  const { emailId } = useParams();
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        // Check if we're viewing a sent email using the query parameter
        const queryParams = new URLSearchParams(location.search);
        const emailSource = queryParams.get('source');
        setLoading(true);
        
        const res = await axios.get(
          `http://localhost:5000/api/emails/${emailId}`,
          { 
            withCredentials: true,
            params: emailSource ? { source: emailSource } : {} 
          }
        );
        setEmail(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching email:", err);
        setError("Failed to load email details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId, location.search]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 pb-10 animate-pulse">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inbox
          </Button>
        </div>

        {/* Email Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>

        {/* AI Summary Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>

        {/* Suggested Reply */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Priority Analysis */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex justify-between mt-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!email) return <p className="p-6 text-red-500">Email not found.</p>;

  return (
    <div className="p-6">
      <EmailSummaryAndReply email={email} />
    </div>
  );
};

export default EmailSummaryPage;
