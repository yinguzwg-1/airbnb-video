import { NextRequest, NextResponse } from "next/server";
import { getMoviesByGenre } from "@/app/actions/getMovieListings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("type");

    if (!genre) {
      return NextResponse.json(
        { error: "电影类型不能为空" },
        { status: 400 }
      );
    }

    const movies = await getMoviesByGenre(genre);
    return NextResponse.json(movies);
  } catch (error) {
    console.error("API筛选电影失败:", error);
    return NextResponse.json(
      { error: "筛选电影失败" },
      { status: 500 }
    );
  }
} 