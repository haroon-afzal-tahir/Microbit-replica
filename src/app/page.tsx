import { getProjects } from './actions';
import { CreateProjectButton } from '@/components/CreateProjectButton';
import { ProjectCard } from '@/components/ProjectCard';
import { CodeIcon, DocumentPlusIcon } from '@/components/ui/Icons';

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CodeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  MicroBit Code Editor
                </h1>
                <p className="text-sm text-gray-500">
                  Learn programming with micro:bit
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
            <p className="text-gray-600 mt-1">
              Create and manage your micro:bit projects
            </p>
          </div>
          <CreateProjectButton />
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={{
                  id: project.id,
                  name: project.name,
                  createdAt: project.createdAt.toISOString(),
                  updatedAt: project.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Learn to code with micro:bit - A fun way to start programming!
          </p>
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <DocumentPlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
      <p className="text-gray-500 mb-6">
        Get started by creating your first micro:bit project!
      </p>
      <CreateProjectButton />
    </div>
  );
}
