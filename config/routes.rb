# config/routes.rb

Rails.application.routes.draw do
  namespace :api do
    resources :tasks do
      member do
        put 'mark_complete'
        put 'mark_active'
      end
    end
    resources :users, only: [:create]
  end

  # Define root route to render the front-end
  root 'home#index'
end
