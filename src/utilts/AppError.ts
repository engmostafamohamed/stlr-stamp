class AppError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Object.setPrototypeOf(this, new.target.prototype) // Ensure correct prototype chain
  }
}

export default AppError
