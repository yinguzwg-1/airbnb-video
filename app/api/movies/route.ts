import { NextResponse } from "next/server";
import getMovieListings from "@/app/actions/getMovieListings";

export async function GET() {
  try {
    const movies = await getMovieListings();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("API获取电影列表失败:", error);
    return NextResponse.json(
      { error: "获取电影列表失败" },
      { status: 500 }
    );
  }
} 