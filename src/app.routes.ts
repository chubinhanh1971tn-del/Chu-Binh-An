import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
  },
  {
    path: 'group-leader',
    loadComponent: () => import('./components/group-leader/group-leader.component').then(m => m.GroupLeaderComponent),
    canActivate: [authGuard],
  },
  {
    path: 'collaborator',
    loadComponent: () => import('./components/collaborator/collaborator.component').then(m => m.CollaboratorComponent),
    canActivate: [authGuard],
  },
  {
    path: 'collaborators',
    loadComponent: () => import('./components/collaborators/collaborators.component').then(m => m.CollaboratorsComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'consultation',
    loadComponent: () => import('./components/consultation/consultation.component').then(m => m.ConsultationComponent),
  },
  {
    path: 'doussing',
    loadComponent: () => import('./components/urban-planning/urban-planning.component').then(m => m.UrbanPlanningComponent),
  },
   {
    path: 'cooperation',
    loadComponent: () => import('./components/cooperation/cooperation.component').then(m => m.CooperationComponent),
  },
  {
    path: 'partnership-proposal',
    loadComponent: () => import('./components/partnership-proposal/partnership-proposal.component').then(m => m.PartnershipProposalComponent),
  },
  {
    path: 'ecosystem',
    loadComponent: () => import('./components/marketing-channels/marketing-channels.component').then(m => m.MarketingChannelsComponent),
  },
  {
    path: 'market-analysis',
    loadComponent: () => import('./components/market-analysis/market-analysis.component').then(m => m.MarketAnalysisComponent),
  },
  {
    path: 'community',
    loadComponent: () => import('./components/community-hub/community-hub.component').then(m => m.CommunityHubComponent),
  },
  {
    path: 'case-study/de-xuat-ban-giao-dat',
    loadComponent: () => import('./components/case-study/case-study.component').then(m => m.CaseStudyComponent),
  },
  {
    path: 'doussing/tac-minh-cau',
    loadComponent: () => import('./components/tac-minh-cau-case-study/tac-minh-cau-case-study.component').then(m => m.TacMinhCauCaseStudyComponent),
  },
  {
    path: 'doussing/khoi-phuc-suoi-qh5',
    loadComponent: () => import('./components/qh5-case-study/qh5-case-study.component').then(m => m.Qh5CaseStudyComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./components/blog/blog.component').then(m => m.BlogComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];