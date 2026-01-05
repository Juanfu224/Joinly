// ==========================================================================
// BARREL EXPORT: SHARED COMPONENTS
// ==========================================================================
// Exportaciones centralizadas para facilitar las importaciones

export { AlertComponent } from './alert/alert';
export { AlertContainerComponent } from './alert-container/alert-container';
export { AvatarComponent } from './avatar/avatar';
export { ButtonComponent } from './button/button';
export { CardComponent } from './card/card';
export { IconComponent } from './icon/icon';
export { type IconName } from './icon/icon-paths';
export { LogoComponent, type LogoVariant, type LogoSize } from './logo/logo';
export { FormInputComponent } from './form-input/form-input';
export { FormTextareaComponent } from './form-textarea/form-textarea';
export { FormSelectComponent, type SelectOption } from './form-select/form-select';
export { FormCheckboxComponent } from './form-checkbox/form-checkbox';
export { FormRadioGroupComponent, type RadioOption } from './form-radio-group/form-radio-group';
export { FormCardComponent } from './form-card/form-card';
export { FormArrayItemComponent } from './form-array-item/form-array-item';
export { CredentialInputGroupComponent } from './credential-input-group/credential-input-group';
export { RegisterFormComponent } from './register-form/register-form';
export { LoginFormComponent } from './login-form/login-form';
export { CreateGroupFormComponent } from './create-group-form/create-group-form';
export { JoinGroupFormComponent } from './join-group-form/join-group-form';
export { NewSubscriptionFormComponent } from './new-subscription-form/new-subscription-form';
export {
  passwordStrengthValidator,
  matchFieldsValidator,
  getControlErrorMessage,
  getFieldErrorMessage,
  codePatternValidator,
  type FieldErrorMessages,
} from './form-validators';

// Nuevos validadores avanzados
export {
  passwordStrength,
  passwordStrengthStrict,
  type PasswordStrengthConfig,
  telefono,
  nif,
  nie,
  nifNie,
  codigoPostal,
  matchFields,
  precioMinimoPlaza,
  requireBothOrNeither,
  atLeastOne,
  dateRange,
  minAge,
  uniqueCredentialLabels,
  credentialFieldsRequired,
  getErrorMessage,
  getAllErrorMessages,
  hasError,
  getFormErrors,
  VALIDATION_MESSAGES,
} from './validators';
export {
  canSubmit,
  focusInput,
  shouldTriggerSubmit,
  createFormState,
  SUBMIT_THROTTLE_MS,
} from './form-utils';
export { BreadcrumbsComponent, type BreadcrumbItem } from './breadcrumbs/breadcrumbs';
export { ThemeToggleComponent } from './theme-toggle/theme-toggle';
export { TooltipDirective, type TooltipPosition } from './tooltip/tooltip.directive';
export { ModalComponent } from './modal/modal';
export { AccordionComponent } from './accordion/accordion';
export { AccordionItemComponent } from './accordion/accordion-item';
export { TabsComponent } from './tabs/tabs';
export { TabComponent } from './tabs/tab';
export { NotificationSenderComponent } from './notification-sender/notification-sender';
export { NotificationReceiverComponent } from './notification-receiver/notification-receiver';
export { ToastComponent } from './toast/toast';
export { ToastContainerComponent } from './toast-container/toast-container';
export { SpinnerOverlayComponent } from './spinner-overlay/spinner-overlay';
export { GroupCardComponent } from './group-card/group-card';
export { EmptyGroupsComponent } from './empty-groups/empty-groups';
export { SubscriptionCardComponent } from './subscription-card/subscription-card';
export { EmptySubscriptionsComponent } from './empty-subscriptions/empty-subscriptions';
export {
  SubscriptionInfoCardComponent,
  type SubscriptionCredentials,
  type PaymentInfo,
  type PaymentStatus,
  type JoinRequest,
  type SubscriptionInfoData,
} from './subscription-info-card';
export { MemberCardComponent, type MemberData, type MemberRole } from './member-card/member-card';
export { MemberListComponent } from './member-list/member-list';
