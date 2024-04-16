import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}

export const ROUTES: RouteInfo[] = [
  {path: '/start', title: 'Iniciar', icon: 'nc-bank', class: ''}
];

@Component({
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
  public menuItems: any[];

  constructor() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
}
