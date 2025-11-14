/*
* 底部菜单tab的数据结构
* */
export interface MenuTabType {
  text: string;
  page: Page;
  icon: Icon;
  activeText: string;
}

export interface Icon {
  normal: Active;
  active: Active;
}

export interface Active {
  url: string;
}

export interface Page {
  name: string;
  id: ID;
}

export interface ID {
  id: string;
  name: string;
  scene: string;
  editUser: string;
  description: string;
  key: string;
  title: string;
  version: null;
  createTime: Date;
  updateTime: Date;
}
