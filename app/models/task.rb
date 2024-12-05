class Task < ApplicationRecord
  belongs_to :user

  # Validations
  validates :content, presence: true
  validates :due, presence: true

  # Optional: Scope to filter completed tasks
  scope :completed, -> { where(complete: true) }
  scope :active, -> { where(complete: false) }

  # Optional: Toggle completion status
  def toggle_completion!
    update!(complete: !complete)
  end
end
