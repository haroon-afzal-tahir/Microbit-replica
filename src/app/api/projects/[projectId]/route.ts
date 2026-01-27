import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{ projectId: string }>;
};

// GET /api/projects/{id} - Get project data
export async function GET(request: Request, { params }: Params) {
  try {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/{id} - Update or create project (upsert)
export async function PUT(request: Request, { params }: Params) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    // Use upsert to create if not exists, update if exists
    const project = await prisma.project.upsert({
      where: { id: projectId },
      update: {
        name: body.name,
        makecodeProject: body.makecodeProject
      },
      create: {
        id: projectId,
        name: body.name || 'Untitled Project',
        makecodeProject: body.makecodeProject
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/{id} - Delete project
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { projectId } = await params;

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
