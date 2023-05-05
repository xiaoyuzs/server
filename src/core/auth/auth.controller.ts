import { UserStatusDTO } from "../user/dto/user-status.dto"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { AuthService } from "./auth.service"
import { Controller, Post, UseGuards, Req, HttpCode, UnauthorizedException, Get } from "@nestjs/common"
import { Request } from "express"
import { AuthGuard } from "@nestjs/passport"

declare module "express" {
  interface Request {
    user: UserStatusDTO
    session: any
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("info")
  @UseGuards(AuthGuard())
  async info(@Req() req: Request): Promise<any> {
    const user: UserStatusDTO = req.user
    const roles: string[] = user.roles
    const username: string = user.username
    return {
      data: { username, roles },
      roles
    }
  }

  @Post("login")
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request) {
    const { user } = req
    const { code } = req.session
    const isLogin = await this.authService.login(user)
    if (isLogin.token) {
      await this.authService.recordLogin(user)
    }
    // 如果验证码与用户输入的验证码不匹配返回错误
    if (code && code !== user.code) {
      throw new UnauthorizedException("验证码错误")
    }
    return isLogin
  }
}
