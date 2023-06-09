import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isEmail,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export default class CustomUsername implements ValidatorConstraintInterface {
  validate(text: string) {
    const isValidName = (arg) => /^[a-zA-Z0-9]{5,18}$/.test(arg);
    return isEmail(text) || isValidName(text);
  }

  defaultMessage(args: ValidationArguments) {
    return '用户名不符合规范';
  }
}
