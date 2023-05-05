import { AuthService } from "../auth.service"
import { Strategy } from "passport-local"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(username: string, password: string, code: string) {
    const user = await this.authService.validateUser({ username, password, code })
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
