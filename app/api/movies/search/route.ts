import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/app/actions/getMovieListings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "搜索关键词不能为空" },
        { status: 400 }
      );
    }

    const movies = await searchMovies(query);
    return NextResponse.json(movies);
  } catch (error) {
    console.error("API搜索电影失败:", error);
    return NextResponse.json(
      { error: "搜索电影失败" },
      { status: 500 }
    );
  }
} 