import PocketBase from "pocketbase";
import type {
  ProjectsResponse,
  ProjectsRecord,
  TypedPocketBase,
  TasksRecord,
  TasksResponse,
} from "./pocketbase-types";

export const pb = new PocketBase(
  import.meta.env.POCKETBASE_URL || process.env.POCKETBASE_URL
) as TypedPocketBase;

pb.autoCancellation(false);

// PROJECTS

export const getProjects = async () => {
  const projects = await pb.collection("projects").getFullList();

  return projects.sort((a, b) => getStatus(a) - getStatus(b));
};

function getStatus(project: ProjectsResponse) {
  switch (project.status) {
    case "not started":
      return 7;
    case "on hold":
      return 6;
    case "started":
      return 5;
    case "in progress":
      return 4;
    case "almost finished":
      return 3;
    case "ongoing":
      return 2;
    case "done":
      return 1;
    default:
      return 0;
  }
}

export const getProject = async (id: string) => {
  const project = await pb.collection("projects").getOne(id);

  return project;
};

export const addProject = async (name: string) => {
  const newProject = await pb.collection("projects").create({
    name,
    created_by: pb.authStore.model?.id,
    status: "not started",
  });

  return newProject;
};

export const deleteProject = async (id: string) => {
  await pb.collection("projects").delete(id);
};

export const updateProject = async (id: string, data: ProjectsRecord) => {
  await pb.collection("projects").update(id, data);
};

// TASKS

export const addTask = async (project_id: string, text: string) => {
  const newTask = await pb.collection("tasks").create({
    project: project_id,
    created_by: pb.authStore.model?.id,
    text,
  });

  return newTask;
};

export const getTasks = async ({
  project_id = null,
  done = false,
}): Promise<TasksResponse<TexpandProject>[]> => {
  const options = {
    filter: ``,
  };

  let filter = `completed = ${done}`;
  filter += ` && project = "${project_id}"`;

  options.filter = filter;

  let tasks: TasksResponse<TexpandProject>[] = [];
  tasks = await pb.collection("tasks").getFullList(options);

  return tasks;
};

export const deleteTask = async (id: string) => {
  await pb.collection("tasks").delete(id);
};

export const updateTask = async (id: string, data: TasksRecord) => {
  await pb.collection("tasks").update(id, data);
};

export const getStarredTasks = async () => {
  const options = {
    sort: "-starred_on",
    filter: "starred = true && completed = false",
    expand: "project",
  };

  let tasks: TasksResponse<TexpandProject>[] = [];
  tasks = await pb.collection("tasks").getFullList(options);

  return tasks;
};

type TexpandProject = {
  project?: ProjectsResponse;
};
