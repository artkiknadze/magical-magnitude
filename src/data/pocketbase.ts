import PocketBase from "pocketbase";

export const pb = new PocketBase(
  import.meta.env.POCKETBASE_URL || process.env.POCKETBASE_URL
);

// PROJECTS

export const getProjects = async () => {
  const projects = await pb.collection("projects").getFullList();

  return projects;
};

export const getProject = async (id: string) => {
  const project = await pb.collection("projects").getOne(id);

  return project;
};

export const addProject = async (name: string) => {
  const newProject = await pb.collection("projects").create({
    name,
    status: "not started",
  });

  return newProject;
};

// TASKS

export const addTask = async (project_id: string, text: string) => {
  const newTask = await pb.collection("tasks").create({
    project: project_id,
    text,
  });

  return newTask;
};

export const getTasks = async (project_id: string) => {
  const options = {
    filter: `project = '${project_id}'`,
  };

  const tasks = await pb.collection("tasks").getFullList(options);

  return tasks;
};
