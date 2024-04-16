import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { TableComponent } from '../../pages/table/table.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { UpgradeComponent } from '../../pages/upgrade/upgrade.component';
import { GamePageComponent } from "../../pages/game/game-page.component";

export const AdminLayoutRoutes: Routes = [
  {path: 'start', component: DashboardComponent},
  {path: 'games/:gameID', component: GamePageComponent},
  {path: 'table', component: TableComponent},
  {path: 'typography', component: TypographyComponent},
  {path: 'icons', component: IconsComponent},
  {path: 'maps', component: MapsComponent},
  {path: 'notifications', component: NotificationsComponent},
  {path: 'upgrade', component: UpgradeComponent}
];
