import apiClient from "./apiClient";

export interface TimetableEntry {
  day: string;
  subjectCode: string;
  subjectName: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

export async function getTimetable() {
  const response = await apiClient.get<TimetableEntry[]>("/timetable");
  return response.data;
}
