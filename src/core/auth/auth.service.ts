import { UserStatusDTO } from "../user/dto/user-status.dto"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { LoginUserDto } from "../user/dto/login-user.dto"
import { UserService } from "../user/user.service"
import * as _ from "lodash"
import * as bcrypt from "bcryptjs"

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async validateCode(sessionCode: string, inputCode: string): Promise<boolean> {
    if (!sessionCode) {
      throw new UnauthorizedException("验证码已过期，请重新获取")
    }
    if (!inputCode || inputCode.trim().toLowerCase() !== sessionCode.trim().toLowerCase()) {
      throw new UnauthorizedException("验证码错误")
    }
    return true
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<UserStatusDTO> {
    const username = loginUserDto.username
    const password = loginUserDto.password
    const code = loginUserDto.code
    if (_.isEmpty(username) || _.isEmpty(password)) {
      throw new UnauthorizedException("用户名或密码不能为空")
    }
    if (_.isEmpty(code)) {
      throw new UnauthorizedException("验证码不能为空")
    }
    const user = await this.userService.findLoginUser(username)
    if (_.isEmpty(user)) {
      throw new UnauthorizedException("用户不存在")
    }
    const isValidPwd = await bcrypt.compare(password, user.password)
    if (!isValidPwd) {
      throw new UnauthorizedException("账号或密码错误")
    }
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      code: code
    }
    return sanitizedUser
  }

  async login(userInfo: UserStatusDTO) {
    return this.createToken(userInfo)
  }

  createToken({ username, id }: UserStatusDTO) {
    const token = this.jwtService.sign({ username, id })
    const expires = process.env.JWT_EXPIRE
    return {
      token,
      expires
    }
  }

  recordLogin(userInfo: UserStatusDTO) {
    const { id } = userInfo
    return this.userService.recordLogin(id)
  }
}
