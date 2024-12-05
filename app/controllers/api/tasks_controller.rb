module Api
  class TasksController < Api::ApplicationController
    before_action :set_task, only: %i[show update destroy mark_complete mark_active]

    # GET /api/tasks
    def index
      @tasks = Task.where(user_id: params[:api_key]) # Adjust logic as needed
      render json: { tasks: @tasks }
    end

    # POST /api/tasks
    def create
      @task = Task.new(task_params)
      @task.user_id = params[:api_key]

      if @task.save
        render json: { task: @task }, status: :created
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/tasks/:id
    def update
      if @task.update(task_params)
        render json: { task: @task }
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/tasks/:id
    def destroy
      @task.destroy
      render json: { success: true }
    end

    # PUT /api/tasks/:id/mark_complete
    def mark_complete
      if @task.update(complete: true)
        render json: { task: @task }, status: :ok
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/tasks/:id/mark_active
    def mark_active
      if @task.update(complete: false)
        render json: { task: @task }, status: :ok
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_task
      @task = Task.find_by(id: params[:id], user_id: params[:api_key])
      render json: { error: 'Task not found' }, status: :not_found unless @task
    end

    def task_params
      params.require(:task).permit(:content, :due)
    end
  end
end
