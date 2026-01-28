'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject() {
  const project = await prisma.project.create({
    data: {
      name: 'Untitled Project',
    },
  });

  redirect(`/editor/makecode/${project.id}`);
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath('/');
}

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
  });
}
