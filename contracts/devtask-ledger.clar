;; DevTask Ledger
;; Track developer tasks on-chain

;; Data structures
(define-map tasks
  { developer: principal, task-id: uint }
  {
    title: (string-ascii 100),
    description: (string-ascii 500),
    timestamp: uint
  }
)

(define-map task-count principal uint)

;; Private functions
(define-private (get-next-task-id (developer principal))
  (default-to u0 (map-get? task-count developer))
)

;; Public functions
(define-public (log-task (title (string-ascii 100)) (description (string-ascii 500)))
  (let
    (
      (developer tx-sender)
      (task-id (get-next-task-id developer))
      (timestamp block-height)
    )
    (map-set tasks
      { developer: developer, task-id: task-id }
      {
        title: title,
        description: description,
        timestamp: timestamp
      }
    )
    (map-set task-count developer (+ task-id u1))
    (ok task-id)
  )
)

;; Read-only functions
(define-read-only (get-task (developer principal) (task-id uint))
  (map-get? tasks { developer: developer, task-id: task-id })
)

(define-read-only (get-task-count (developer principal))
  (default-to u0 (map-get? task-count developer))
)