import apiClient from "./apiClient";

export type LostFoundPost = {
  id: number;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  location: string;
  dateOccurred: string | null;
  imageUrl: string | null;
  status: "ACTIVE" | "CLAIMED" | "RETURNED" | "CLOSED";
  reporterName: string;
  reporterAvatarUrl: string | null;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LostFoundClaim = {
  id: number;
  postId: number;
  postTitle: string;
  postType: "LOST" | "FOUND";
  postImageUrl: string | null;
  claimantName: string;
  claimantAvatarUrl: string | null;
  message: string;
  details: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

export type ClaimMessage = {
  id: number;
  claimId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  content: string;
  createdAt: string;
};

export type LostFoundReportInput = {
  type: "LOST" | "FOUND";
  title: string;
  description?: string;
  category?: string;
  location: string;
  dateOccurred?: string;
};

export async function browseLostFound(params: {
  type?: "LOST" | "FOUND";
  q?: string;
  category?: string;
}) {
  const response = await apiClient.get<LostFoundPost[]>("/api/lost-found", { params });
  return response.data;
}

export async function getMyReports() {
  const response = await apiClient.get<LostFoundPost[]>("/api/lost-found/mine");
  return response.data;
}

export async function createLostFoundReport(input: LostFoundReportInput, file?: File) {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  if (input.category) formData.append("category", input.category);
  formData.append("location", input.location);
  if (input.dateOccurred) formData.append("dateOccurred", input.dateOccurred);
  if (file) formData.append("file", file);
  const response = await apiClient.post<LostFoundPost>("/api/lost-found", formData);
  return response.data;
}

export async function updateLostFoundReport(id: number, input: LostFoundReportInput, file?: File) {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  if (input.category) formData.append("category", input.category);
  formData.append("location", input.location);
  if (input.dateOccurred) formData.append("dateOccurred", input.dateOccurred);
  if (file) formData.append("file", file);
  const response = await apiClient.put<LostFoundPost>(`/api/lost-found/${id}`, formData);
  return response.data;
}

export async function deleteLostFoundReport(id: number) {
  await apiClient.delete(`/api/lost-found/${id}`);
}

export async function markReturned(id: number) {
  const response = await apiClient.put<LostFoundPost>(`/api/lost-found/${id}/returned`);
  return response.data;
}

export async function getClaimsForPost(id: number) {
  const response = await apiClient.get<LostFoundClaim[]>(`/api/lost-found/${id}/claims`);
  return response.data;
}

export async function submitClaim(id: number, message: string, details?: string) {
  const response = await apiClient.post<LostFoundClaim>(`/api/lost-found/${id}/claims`, {
    message,
    details: details ?? null,
  });
  return response.data;
}

export async function getMyClaims() {
  const response = await apiClient.get<LostFoundClaim[]>("/api/lost-found/claims/mine");
  return response.data;
}

export async function getClaim(claimId: number) {
  const response = await apiClient.get<LostFoundClaim>(`/api/lost-found/claims/${claimId}`);
  return response.data;
}

export async function acceptClaim(claimId: number) {
  const response = await apiClient.put<LostFoundClaim>(`/api/lost-found/claims/${claimId}/accept`);
  return response.data;
}

export async function rejectClaim(claimId: number) {
  const response = await apiClient.put<LostFoundClaim>(`/api/lost-found/claims/${claimId}/reject`);
  return response.data;
}

export async function getClaimMessages(claimId: number) {
  const response = await apiClient.get<ClaimMessage[]>(
    `/api/lost-found/claims/${claimId}/messages`,
  );
  return response.data;
}

export async function sendClaimMessage(claimId: number, content: string) {
  const response = await apiClient.post<ClaimMessage>(
    `/api/lost-found/claims/${claimId}/messages`,
    {
      content,
    },
  );
  return response.data;
}
