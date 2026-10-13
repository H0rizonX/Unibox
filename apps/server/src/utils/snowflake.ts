class Snowflake {
  // 基础配置（标准雪花）
  private readonly startTime = 1752460800000 // 2025-01-01 时间基准
  private readonly workerIdBits = 5
  private readonly dataCenterBits = 5
  private readonly sequenceBits = 12

  private readonly maxWorkerId = (1 << this.workerIdBits) - 1
  private readonly maxDataCenterId = (1 << this.dataCenterBits) - 1
  private readonly maxSequence = (1 << this.sequenceBits) - 1

  private readonly workerIdShift = this.sequenceBits
  private readonly dataCenterShift = this.sequenceBits + this.workerIdBits
  private readonly timestampShift =
    this.sequenceBits + this.workerIdBits + this.dataCenterBits

  private workerId: number
  private dataCenterId: number
  private sequence = 0
  private lastTimestamp = -1

  constructor(workerId = 0, dataCenterId = 0) {
    if (workerId > this.maxWorkerId || workerId < 0) {
      throw new Error(`机器ID范围 0~${this.maxWorkerId}`)
    }
    if (dataCenterId > this.maxDataCenterId || dataCenterId < 0) {
      throw new Error(`机房ID范围 0~${this.maxDataCenterId}`)
    }
    this.workerId = workerId
    this.dataCenterId = dataCenterId
  }

  /**
   * 核心对外方法：生成指定长度的雪花ID字符串
   * @param targetLength 目标ID长度，范围6~19
   * @returns 定长数字字符串
   */
  nextId(targetLength: number): string {
    if (
      typeof targetLength !== 'number' ||
      targetLength < 6 ||
      targetLength > 19
    ) {
      throw new Error('长度仅支持 6 ~ 19')
    }

    const rawId = this.generateRawBigInt()
    const rawStr = rawId.toString()

    // 方案：补前导零 / 尾部截断，保证固定长度
    if (rawStr.length < targetLength) {
      // 不足长度：左侧补0
      return rawStr.padStart(targetLength, '0')
    } else if (rawStr.length > targetLength) {
      // 超出长度：截取末尾N位（保留唯一性区间）
      return rawStr.slice(-targetLength)
    } else {
      return rawStr
    }
  }

  // 生成原生64位雪花BigInt
  private generateRawBigInt(): bigint {
    let timestamp = Date.now()

    // 时钟回拨处理
    if (timestamp < this.lastTimestamp) {
      const offset = this.lastTimestamp - timestamp
      if (offset > 1000) throw new Error('时钟回拨超过1秒，拒绝生成ID')
      // 短暂等待时钟追上
      while (timestamp < this.lastTimestamp) timestamp = Date.now()
    }

    // 同一毫秒序列号自增
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & this.maxSequence
      if (this.sequence === 0) {
        // 序列号耗尽，等待下一毫秒
        while (timestamp <= this.lastTimestamp) timestamp = Date.now()
      }
    } else {
      this.sequence = 0
    }

    this.lastTimestamp = timestamp

    const timePart =
      BigInt(timestamp - this.startTime) << BigInt(this.timestampShift)
    const dataPart = BigInt(this.dataCenterId) << BigInt(this.dataCenterShift)
    const workerPart = BigInt(this.workerId) << BigInt(this.workerIdShift)
    const seqPart = BigInt(this.sequence)

    return timePart | dataPart | workerPart | seqPart
  }
}

// 使用示例
export const snow = new Snowflake(1, 1)
