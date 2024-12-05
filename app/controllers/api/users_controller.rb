module Api
  class UsersController < Api::ApplicationController
    # POST /api/users
    def create
      @user = User.new(user_params)

      if @user.save
        render json: { success: true, id: @user.id }, status: :created
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def user_params
      # Define user parameters as needed, e.g.,
      # params.require(:user).permit(:name, :email, :password)
      params.permit(:name, :email) # Adjust based on your User model
    end
  end
end
