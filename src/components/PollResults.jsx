import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Users, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { pollsApi } from "@/services/Api";

export default function PollResults() {
  const { id } = useParams();
  const { access_token } = useAuthStore();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPollResults();
  }, [id]);

  const fetchPollResults = async () => {
    setLoading(true);
    try {
      const response = await pollsApi.getPollResults(id, access_token);
      if (response.success) {
        setPoll(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => window.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{poll.title}</CardTitle>
            <Badge className={
              poll.status === 'active' ? 'bg-green-100 text-green-800' :
              poll.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }>
              {poll.status}
            </Badge>
          </div>
          <p className="text-gray-600">{poll.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(poll.start_date).toLocaleDateString()} - {new Date(poll.end_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {totalVotes} total votes
            </span>
            {poll.is_targeted && (
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Targeted
              </span>
            )}
          </div>

          <div className="space-y-4">
            {poll.options.map((option, index) => {
              const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                      {option.label}
                    </span>
                    <span className="font-medium">{option.vote_count || 0} votes ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: option.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}