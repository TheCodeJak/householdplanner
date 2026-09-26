"use client";

import { Button } from "jaklib";
import { useState } from "react";

function FamilyModal() {
  const [open, setOpen] = useState(false);
  return (
    <Button variant="success">
      <div>Familie bearbeiten</div>
    </Button>
  );
}

export default FamilyModal;
