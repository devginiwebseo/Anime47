import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map resource names to Prisma models
const resourceModelMap: Record<string, string> = {
  users: "user",
  stories: "story",
  chapters: "chapter",
  genres: "genre",
  authors: "author",
  actors: "actor",
  tags: "tag",
  comments: "comment",
  favorites: "favorite",
  media: "media",
  settings: "setting",
  crawl_logs: "crawlLog",
  pages: "page",
  story_actors: "storyActor",
};

// Define includes per resource for relations
const resourceIncludes: Record<string, any> = {
  comments: { story: { select: { id: true, title: true, slug: true } } },
  authors: { stories: { select: { id: true, title: true, slug: true }, take: 10 } },
  actors: { stories: { include: { story: { select: { id: true, title: true, slug: true } } }, take: 10 } },
};

function getPrismaModel(resource: string) {
  const modelName = resourceModelMap[resource];
  if (!modelName) {
    throw new Error(`Unknown resource: ${resource}`);
  }
  return (prisma as any)[modelName];
}

// GET - List or Get One
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const id = searchParams.get("id");
    const current = parseInt(searchParams.get("current") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const filtersJson = searchParams.get("filters");
    const sortersJson = searchParams.get("sorters");

    if (!resource) {
      return NextResponse.json({ error: "Resource is required" }, { status: 400 });
    }

    const model = getPrismaModel(resource);

    // Get One
    if (id) {
      const data = await model.findUnique({ where: { id } });
      if (!data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ data });
    }

    // Get List
    const skip = (current - 1) * pageSize;
    const take = pageSize;

    // Build where clause from filters
    let where: any = {};
    if (filtersJson) {
      try {
        const filters = JSON.parse(filtersJson);
        filters.forEach((filter: any) => {
          if (filter.operator === "contains") {
            where[filter.field] = { contains: filter.value, mode: "insensitive" };
          } else if (filter.operator === "eq") {
            where[filter.field] = filter.value;
          }
        });
      } catch (e) {
        // ignore parse errors
      }
    }

    // Build orderBy from sorters
    let orderBy: any = { createdAt: "desc" };
    if (sortersJson) {
      try {
        const sorters = JSON.parse(sortersJson);
        if (sorters.length > 0) {
          orderBy = { [sorters[0].field]: sorters[0].order };
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    // Build include from resource config
    const include = resourceIncludes[resource!] || undefined;

    const [data, total] = await Promise.all([
      model.findMany({ where, orderBy, skip, take, ...(include ? { include } : {}) }),
      model.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error: any) {
    console.error("GET /api/refine error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// POST - Create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, variables } = body;

    if (!resource || !variables) {
      return NextResponse.json({ error: "Resource and variables are required" }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const data = await model.create({ data: variables });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/refine error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource, id, variables } = body;

    if (!resource || !id || !variables) {
      return NextResponse.json({ error: "Resource, id, and variables are required" }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const data = await model.update({
      where: { id },
      data: variables,
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("PATCH /api/refine error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const id = searchParams.get("id");

    if (!resource || !id) {
      return NextResponse.json({ error: "Resource and id are required" }, { status: 400 });
    }

    const model = getPrismaModel(resource);
    const data = await model.delete({ where: { id } });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("DELETE /api/refine error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
