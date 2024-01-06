export interface NodeData {
  id: string;
  nodeLabel: string;
  color: string;
  index: string;
  title: string;
  tags: Tag[];
  url: string;
}

export interface LinkData {
  source: string;
  target: string;
}

export interface Tag {
  id: string;
  name: string;
}
