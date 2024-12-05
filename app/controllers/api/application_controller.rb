module Api
  class ApplicationController < ActionController::API
    # CSRF protection is disabled for API controllers by default in ActionController::API

    # Optional: Handle exceptions gracefully
    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :render_unprocessable_entity

    private

    def render_not_found(exception)
      render json: { error: exception.message }, status: :not_found
    end

    def render_unprocessable_entity(exception)
      render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
