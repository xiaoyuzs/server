import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common"
import { HttpException } from "@nestjs/common"
import { CreateUserDto } from "./dto/create-user.dto"
import * as _ from "lodash"
import * as svgCaptcha from "svg-captcha"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { QueryFailedError, Repository } from "typeorm"
import { ResultData } from "@utils/result"
import { UpdateUserDto } from "@/core/user/dto/update-user.dto"

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>
  ) {}

  async findUser(id: User["id"]) {
    return await this.repository.findOneBy({ id })
  }

  async register(createUserDto: CreateUserDto) {
    const username = createUserDto.username
    const password = createUserDto.password
    const userDO = {
      username,
      password,
      memo_count: 0,
      day_count: 0,
      tag_count: 0,
      month_sign_id: 0,
      last_login: ""
    }
    try {
      const user = this.repository.create(userDO)
      const result = await this.repository.save(user)
      if (_.isEmpty(result)) {
        return user
      }

      return ResultData.ok(result)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new HttpException("用户名已存在", HttpStatus.BAD_REQUEST)
      } else {
        throw error
      }
    }
  }

  async recordLogin(userId: string) {
    const last_login = new Date().toISOString()

    return await this.repository.update(userId, {
      last_login
    })
  }

  findLoginUser(username: string) {
    return this.repository.findOne({
      where: { username },
      select: ["id", "username", "password", "nickname", "last_login"]
    })
  }
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const userDo = {
      nickname: updateUserDto.nickname
    }
    const res = await this.repository.update({ id: userId }, userDo)
    return res.affected >= 0
  }
}
