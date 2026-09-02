# pattern.revision-conflict.v1

Every mutation sends the revision sequence the user or agent observed. A mismatch
must reject the write without merging silently. Return the current sequence and a
plain-language recovery action. Preserve the caller's attempted value so it can
be compared or reapplied deliberately.

