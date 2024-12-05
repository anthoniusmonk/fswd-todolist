class Task < ApplicationRecord
  belongs_to :user, optional: true

  # Validations
  validates :content, presence: true
  validates :user, presence: true

  # Optional: Scope to filter completed tasks
  scope :completed, -> { where(complete: true) }
  scope :active, -> { where(complete: false) }

  # Optional: Toggle completion status
  def toggle_completion!
    update!(complete: !complete)
  end
end
