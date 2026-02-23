import { useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "convex/_generated/api"
import { Id } from "convex/_generated/dataModel"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Camera01Icon,
    UploadSquare01Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    Delete02Icon,
    StarIcon,
    FingerPrintIcon,
    ImageAdd01Icon,
    AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SubjectType = "inmate" | "officer"
type PhotoProvider = "internal" | "external_url" | "upload"
type FpProvider = "internal" | "external" | "upload"
type PhotoType = "mugshot_front" | "mugshot_side" | "mugshot_3quarter" | "document" | "profile"
type FingerKey =
    | "right_thumb" | "right_index" | "right_middle" | "right_ring" | "right_little"
    | "left_thumb" | "left_index" | "left_middle" | "left_ring" | "left_little"

const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
    { value: "mugshot_front", label: "Mugshot — Front" },
    { value: "mugshot_side", label: "Mugshot — Side" },
    { value: "mugshot_3quarter", label: "Mugshot — ¾ View" },
    { value: "profile", label: "Profile Photo" },
    { value: "document", label: "Document / ID" },
]

const FINGERS: { key: FingerKey; label: string; short: string }[] = [
    { key: "right_thumb", label: "Right Thumb", short: "R.Thumb" },
    { key: "right_index", label: "Right Index", short: "R.Index" },
    { key: "right_middle", label: "Right Middle", short: "R.Mid" },
    { key: "right_ring", label: "Right Ring", short: "R.Ring" },
    { key: "right_little", label: "Right Little", short: "R.Little" },
    { key: "left_thumb", label: "Left Thumb", short: "L.Thumb" },
    { key: "left_index", label: "Left Index", short: "L.Index" },
    { key: "left_middle", label: "Left Middle", short: "L.Mid" },
    { key: "left_ring", label: "Left Ring", short: "L.Ring" },
    { key: "left_little", label: "Left Little", short: "L.Little" },
]

// ─── Panel props ──────────────────────────────────────────────────────────────

interface BiometricsPanelProps {
    subjectType: SubjectType
    subjectId?: string
    capturedById?: string
}

// ─── Unsaved subject notice ───────────────────────────────────────────────────

function UnsavedNotice() {
    return (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30 dark:border-amber-800">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Save the record first before attaching photos or fingerprints.
            </p>
        </div>
    )
}

// ─── Confirm / Reject badge ───────────────────────────────────────────────────

function ConfirmBadge({
    id, isConfirmed, type, capturedById,
}: {
    id: string
    isConfirmed?: boolean
    type: "photo" | "fp"
    capturedById?: string
}) {
    const confirmPhoto = useMutation(api.biometrics.confirmPhoto)
    const rejectPhoto = useMutation(api.biometrics.rejectPhoto)
    const confirmFp = useMutation(api.biometrics.confirmFingerprint)
    const rejectFp = useMutation(api.biometrics.rejectFingerprint)

    const doConfirm = async () => {
        try {
            if (type === "photo") {
                await confirmPhoto({ id: id as Id<"photoBucket">, confirmedById: capturedById as Id<"officers"> })
            } else {
                await confirmFp({ id: id as Id<"fingerPrints">, confirmedById: capturedById as Id<"officers"> })
            }
            toast.success("Confirmed")
        } catch (e: any) { toast.error(e.message) }
    }

    const doReject = async () => {
        try {
            if (type === "photo") {
                await rejectPhoto({ id: id as Id<"photoBucket"> })
            } else {
                await rejectFp({ id: id as Id<"fingerPrints"> })
            }
            toast.success("Marked as rejected")
        } catch (e: any) { toast.error(e.message) }
    }

    if (isConfirmed) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
                Confirmed
            </span>
        )
    }

    return (
        <div className="flex items-center gap-1 flex-wrap">
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                Pending
            </span>
            {capturedById && (
                <>
                    <button
                        type="button"
                        onClick={doConfirm}
                        className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
                        Confirm
                    </button>
                    <button
                        type="button"
                        onClick={doReject}
                        className="inline-flex items-center gap-0.5 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] text-red-700 hover:bg-red-100 transition-colors"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                        Reject
                    </button>
                </>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// PHOTO SECTION
// ════════════════════════════════════════════════════════════════════════════

function PhotoSection({ subjectType, subjectId, capturedById }: BiometricsPanelProps) {
    const addPhoto = useMutation(api.biometrics.addPhoto)
    const deletePhoto = useMutation(api.biometrics.deletePhoto)
    const setPrimary = useMutation(api.biometrics.setPrimaryPhoto)
    const generateUploadUrl = useMutation(api.biometrics.generatePhotoUploadUrl)

    // Conditional hook — only runs when subjectId exists
    const inmatePhotos = useQuery(
        api.biometrics.getPhotosByInmate,
        subjectType === "inmate" && subjectId ? { inmateId: subjectId as Id<"inmates"> } : "skip"
    )
    const officerPhotos = useQuery(
        api.biometrics.getPhotosByOfficer,
        subjectType === "officer" && subjectId ? { officerId: subjectId as Id<"officers"> } : "skip"
    )
    const photos = subjectType === "inmate" ? inmatePhotos : officerPhotos

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const [provider, setProvider] = useState<PhotoProvider>("upload")
    const [photoType, setPhotoType] = useState<PhotoType>(
        subjectType === "officer" ? "profile" : "mugshot_front"
    )
    const [externalUrl, setExternalUrl] = useState("")
    const [streaming, setStreaming] = useState(false)
    const [captured, setCaptured] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    // ── Webcam helpers ──────────────────────────────────────────────────────────

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
            setStreaming(true)
            setCaptured(null)
        } catch {
            toast.error("Camera access denied or unavailable")
        }
    }

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream | null
        stream?.getTracks().forEach((t) => t.stop())
        if (videoRef.current) videoRef.current.srcObject = null
        setStreaming(false)
    }

    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return
        const ctx2d = canvasRef.current.getContext("2d")!
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx2d.drawImage(videoRef.current, 0, 0)
        setCaptured(canvasRef.current.toDataURL("image/jpeg", 0.85))
        stopCamera()
    }

    // ── Save ────────────────────────────────────────────────────────────────────

    const save = async () => {
        if (!subjectId) { toast.error("Save the record first"); return }
        setBusy(true)
        try {
            const base: Record<string, any> = {
                subjectType,
                ...(subjectType === "inmate" ? { inmateId: subjectId } : { officerId: subjectId }),
                photoType,
                provider,
                capturedById: capturedById ?? undefined,
            }

            if (provider === "internal") {
                if (!captured) { toast.error("Capture a photo first"); setBusy(false); return }
                const blob = await (await fetch(captured)).blob()
                const uploadUrl = await generateUploadUrl()
                const res = await fetch(uploadUrl, {
                    method: "POST",
                    body: blob,
                    headers: { "Content-Type": "image/jpeg" }
                })
                const { storageId } = await res.json()
                await addPhoto({
                    ...base,
                    storageId,
                    mimeType: "image/jpeg",
                    subjectType: base.subjectType,
                    photoType: base.photoType,
                    provider: base.provider
                })
                setCaptured(null)

            } else if (provider === "external_url") {
                if (!externalUrl.trim()) {
                    toast.error("Enter a URL");
                    setBusy(false);
                    return
                }
                await addPhoto({
                    ...base,
                    externalUrl: externalUrl.trim(),
                    subjectType: base.subjectType,
                    photoType: base.photoType,
                    provider: base.provider
                })
                setExternalUrl("")

            } else {
                const file = fileRef.current?.files?.[0]
                if (!file) { toast.error("Select a file"); setBusy(false); return }
                const uploadUrl = await generateUploadUrl()
                const res = await fetch(uploadUrl, { method: "POST", body: file, headers: { "Content-Type": file.type } })
                const { storageId } = await res.json()
                await addPhoto({
                    ...base,
                    storageId,
                    mimeType: file.type,
                    fileSize: file.size,
                    subjectType: base.subjectType,
                    provider: base.provider,
                    photoType: base.photoType
                })
                if (fileRef.current) fileRef.current.value = ""
            }

            toast.success("Photo saved — pending confirmation")
        } catch (e: any) { toast.error(e.message) }
        setBusy(false)
    }

    return (
        <div className="space-y-4">
            {!subjectId && <UnsavedNotice />}

            {/* ── Capture controls ─────────────────────────────────────────────── */}
            <div className="rounded-lg border border-border/60 bg-sidebar/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground font-medium">Photo type</p>
                        <Select value={photoType} onValueChange={(v) => setPhotoType(v as PhotoType)}>
                            <SelectTrigger className="h-8 rounded text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PHOTO_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] text-muted-foreground font-medium">Source</p>
                        <Select value={provider} onValueChange={(v) => { setProvider(v as PhotoProvider); stopCamera(); setCaptured(null) }}>
                            <SelectTrigger className="h-8 rounded text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="internal" className="text-xs">Webcam (internal)</SelectItem>
                                <SelectItem value="external_url" className="text-xs">External URL</SelectItem>
                                <SelectItem value="upload" className="text-xs">Upload file</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Webcam view */}
                {provider === "internal" && (
                    <div className="space-y-2">
                        <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                            {captured ? (
                                <img src={captured} alt="Captured" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <video ref={videoRef} className={cn("w-full h-full object-cover", !streaming && "hidden")} />
                                    {!streaming && (
                                        <div className="flex flex-col items-center gap-2 p-6">
                                            <HugeiconsIcon icon={Camera01Icon} className="size-10 text-muted-foreground/50" />
                                            <p className="text-xs text-muted-foreground">Camera inactive</p>
                                        </div>
                                    )}
                                </>
                            )}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <div className="flex gap-2">
                            {!streaming && !captured && (
                                <Button type="button" size="sm" variant="outline" className="gap-1.5 text-xs" onClick={startCamera}>
                                    <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                                    Start Camera
                                </Button>
                            )}
                            {streaming && (
                                <>
                                    <Button type="button" size="sm" className="gap-1.5 text-xs" onClick={captureFrame}>
                                        <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                                        Capture
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={stopCamera}>
                                        Cancel
                                    </Button>
                                </>
                            )}
                            {captured && !streaming && (
                                <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => { setCaptured(null); startCamera() }}>
                                    Retake
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* External URL */}
                {provider === "external_url" && (
                    <div className="flex gap-2 items-center">
                        <input
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="flex-1 h-8 rounded border border-border bg-background px-2.5 text-xs"
                        />
                        {externalUrl && (
                            <img src={externalUrl} alt="Preview" className="size-8 rounded object-cover border border-border shrink-0" />
                        )}
                    </div>
                )}

                {/* File upload */}
                {provider === "upload" && (
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium cursor-pointer"
                    />
                )}

                <Button
                    type="button"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={save}
                    disabled={busy || !subjectId}
                >
                    <HugeiconsIcon icon={UploadSquare01Icon} className="size-3.5" />
                    {busy ? "Saving…" : "Save Photo"}
                </Button>
            </div>

            {/* ── Saved photos ──────────────────────────────────────────────────── */}
            {photos && photos.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Saved Photos ({photos.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo: any) => (
                            <div
                                key={photo._id}
                                className={cn(
                                    "rounded-lg border overflow-hidden",
                                    photo.isPrimary
                                        ? "border-primary/50 ring-1 ring-primary/30"
                                        : "border-border/60"
                                )}
                            >
                                {photo.externalUrl ? (
                                    <img src={photo.externalUrl} alt="" className="w-full aspect-video object-cover bg-muted" />
                                ) : (
                                    <div className="w-full aspect-video bg-muted flex items-center justify-center">
                                        <HugeiconsIcon icon={ImageAdd01Icon} className="size-8 text-muted-foreground/40" />
                                    </div>
                                )}
                                <div className="p-2 space-y-1.5 bg-sidebar">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="text-[11px] font-medium capitalize truncate">
                                            {photo.photoType.replace(/_/g, " ")}
                                        </p>
                                        {photo.isPrimary && (
                                            <span className="text-[10px] text-amber-600 font-medium shrink-0">★ Primary</span>
                                        )}
                                    </div>
                                    <ConfirmBadge
                                        id={photo._id}
                                        isConfirmed={photo.isConfirmed}
                                        type="photo"
                                        capturedById={capturedById}
                                    />
                                    <div className="flex gap-1.5">
                                        {!photo.isPrimary && (
                                            <button
                                                type="button"
                                                onClick={() => setPrimary({ id: photo._id as Id<"photoBucket"> }).then(() => toast.success("Set as primary"))}
                                                className="flex-1 flex items-center justify-center gap-1 rounded border border-border py-0.5 text-[10px] hover:bg-muted transition-colors"
                                            >
                                                <HugeiconsIcon icon={StarIcon} className="size-3" />
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => deletePhoto({ id: photo._id as Id<"photoBucket"> }).then(() => toast.success("Deleted"))}
                                            className="flex items-center justify-center px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// FINGERPRINT SECTION
// ════════════════════════════════════════════════════════════════════════════

function FingerprintSection({ subjectType, subjectId, capturedById }: BiometricsPanelProps) {
    const addFingerprint = useMutation(api.biometrics.addFingerprint)
    const deleteFingerprint = useMutation(api.biometrics.deleteFingerprint)
    const generateUploadUrl = useMutation(api.biometrics.generateFingerprintUploadUrl)

    const inmateFingerprints = useQuery(
        api.biometrics.getFingerprintsByInmate,
        subjectType === "inmate" && subjectId ? { inmateId: subjectId as Id<"inmates"> } : "skip"
    )
    const officerFingerprints = useQuery(
        api.biometrics.getFingerprintsByOfficer,
        subjectType === "officer" && subjectId ? { officerId: subjectId as Id<"officers"> } : "skip"
    )
    const fingerprints = subjectType === "inmate" ? inmateFingerprints : officerFingerprints

    const capturedSet = new Set((fingerprints ?? []).map((f: any) => f.finger))

    const fpFileRef = useRef<HTMLInputElement>(null)
    const [provider, setProvider] = useState<FpProvider>("upload")
    const [selectedFinger, setSelectedFinger] = useState<FingerKey>("right_thumb")
    const [templateData, setTemplateData] = useState("")
    const [providerName, setProviderName] = useState("")
    const [providerRef, setProviderRef] = useState("")
    const [busy, setBusy] = useState(false)

    const save = async () => {
        if (!subjectId) { toast.error("Save the record first"); return }
        setBusy(true)
        try {
            const base: Record<string, any> = {
                subjectType,
                ...(subjectType === "inmate" ? { inmateId: subjectId } : { officerId: subjectId }),
                finger: selectedFinger,
                provider,
                capturedById: capturedById ?? undefined,
                providerName: providerName.trim() || undefined,
                providerRef: providerRef.trim() || undefined,
            }

            if (provider === "internal") {
                // Tauri USB scanner integration point — stub for now
                await addFingerprint({
                    ...base,
                    templateData: "SCANNER_PLACEHOLDER",
                    subjectType: base.subjectType,
                    provider: base.provider,
                    finger: base.finger
                })

            } else if (provider === "external") {
                if (!templateData.trim()) {
                    toast.error("Paste template data");
                    setBusy(false);
                    return
                }
                await addFingerprint({
                    ...base,
                    templateData: templateData.trim(),
                    subjectType: base.subjectType,
                    provider: base.provider,
                    finger: base.finger
                })
                setTemplateData("")

            } else {
                const file = fpFileRef.current?.files?.[0]
                if (!file) { toast.error("Select a file"); setBusy(false); return }
                const uploadUrl = await generateUploadUrl()
                const res = await fetch(uploadUrl, { method: "POST", body: file, headers: { "Content-Type": file.type } })
                const { storageId } = await res.json()
                await addFingerprint({
                    ...base,
                    storageId,
                    subjectType: base.subjectType,
                    provider: base.provider,
                    finger: base.finger
                })
                if (fpFileRef.current) fpFileRef.current.value = ""
            }

            toast.success(`${selectedFinger.replace(/_/g, " ")} saved — pending confirmation`)
        } catch (e: any) { toast.error(e.message) }
        setBusy(false)
    }

    return (
        <div className="space-y-4">
            {!subjectId && <UnsavedNotice />}

            {/* ── Finger selector grid ─────────────────────────────────────────── */}
            <div className="rounded-lg border border-border/60 bg-sidebar/50 p-4 space-y-3">
                <p className="text-[11px] font-medium text-muted-foreground">Select finger</p>

                {/* Right hand */}
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground/70 px-0.5">Right Hand</p>
                    <div className="grid grid-cols-5 gap-1">
                        {FINGERS.slice(0, 5).map(({ key, short }) => {
                            const captured = capturedSet.has(key)
                            const isSelected = selectedFinger === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedFinger(key)}
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1 transition-all",
                                        isSelected ? "border-primary bg-primary/5 text-primary"
                                            : captured ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800"
                                                : "border-border/60 hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <HugeiconsIcon icon={FingerPrintIcon} className="size-4" />
                                    <span className="text-[9px] leading-tight text-center font-medium">{short.replace("R.", "")}</span>
                                    {captured && <span className="size-1 rounded-full bg-emerald-500" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Left hand */}
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground/70 px-0.5">Left Hand</p>
                    <div className="grid grid-cols-5 gap-1">
                        {FINGERS.slice(5).map(({ key, short }) => {
                            const captured = capturedSet.has(key)
                            const isSelected = selectedFinger === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedFinger(key)}
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 rounded-lg border py-2 px-1 transition-all",
                                        isSelected ? "border-primary bg-primary/5 text-primary"
                                            : captured ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800"
                                                : "border-border/60 hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <HugeiconsIcon icon={FingerPrintIcon} className="size-4" />
                                    <span className="text-[9px] leading-tight text-center font-medium">{short.replace("L.", "")}</span>
                                    {captured && <span className="size-1 rounded-full bg-emerald-500" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${(capturedSet.size / 10) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{capturedSet.size}/10</span>
                </div>

                {/* Provider */}
                <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Capture method</p>
                    <Select value={provider} onValueChange={(v) => setProvider(v as FpProvider)}>
                        <SelectTrigger className="h-8 rounded text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="internal" className="text-xs">Internal (USB Scanner)</SelectItem>
                            <SelectItem value="external" className="text-xs">External provider template</SelectItem>
                            <SelectItem value="upload" className="text-xs">Upload template file</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {provider === "internal" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                        Connect a compatible USB fingerprint scanner. Click Save to trigger the capture via the scanner driver.
                    </div>
                )}

                {provider === "external" && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={providerName}
                                onChange={(e) => setProviderName(e.target.value)}
                                placeholder="Provider (e.g. Suprema)"
                                className="h-8 rounded border border-border bg-background px-2.5 text-xs w-full"
                            />
                            <input
                                value={providerRef}
                                onChange={(e) => setProviderRef(e.target.value)}
                                placeholder="External ref ID"
                                className="h-8 rounded border border-border bg-background px-2.5 text-xs w-full"
                            />
                        </div>
                        <textarea
                            value={templateData}
                            onChange={(e) => setTemplateData(e.target.value)}
                            placeholder="Paste base64 WSQ / ISO minutiae template data…"
                            rows={3}
                            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs font-mono resize-none"
                        />
                    </div>
                )}

                {provider === "upload" && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={providerName}
                                onChange={(e) => setProviderName(e.target.value)}
                                placeholder="Provider name (optional)"
                                className="h-8 rounded border border-border bg-background px-2.5 text-xs w-full"
                            />
                            <input
                                value={providerRef}
                                onChange={(e) => setProviderRef(e.target.value)}
                                placeholder="Ref ID (optional)"
                                className="h-8 rounded border border-border bg-background px-2.5 text-xs w-full"
                            />
                        </div>
                        <input
                            ref={fpFileRef}
                            type="file"
                            accept=".wsq,.iso,.bin,.dat,image/*"
                            className="w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:font-medium cursor-pointer"
                        />
                    </div>
                )}

                <Button
                    type="button"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={save}
                    disabled={busy || !subjectId}
                >
                    <HugeiconsIcon icon={FingerPrintIcon} className="size-3.5" />
                    {busy ? "Saving…" : `Save — ${FINGERS.find((f) => f.key === selectedFinger)?.label}`}
                </Button>
            </div>

            {/* ── Saved fingerprints list ──────────────────────────────────────── */}
            {fingerprints && fingerprints.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Saved ({fingerprints.length}/10)
                    </p>
                    <div className="space-y-1.5">
                        {fingerprints.map((fp: any) => (
                            <div
                                key={fp._id}
                                className="flex items-center gap-3 rounded-lg border border-border/60 bg-sidebar/50 px-3 py-2"
                            >
                                <HugeiconsIcon
                                    icon={FingerPrintIcon}
                                    className={cn("size-4 shrink-0", fp.isConfirmed ? "text-emerald-600" : "text-amber-500")}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium capitalize">{fp.finger.replace(/_/g, " ")}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {fp.provider}{fp.providerName ? ` — ${fp.providerName}` : ""}
                                    </p>
                                </div>
                                <ConfirmBadge
                                    id={fp._id}
                                    isConfirmed={fp.isConfirmed}
                                    type="fp"
                                    capturedById={capturedById}
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteFingerprint({ id: fp._id as Id<"fingerPrints"> }).then(() => toast.success("Deleted"))}
                                    className="shrink-0 flex items-center justify-center size-6 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                >
                                    <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTED PANEL
// ════════════════════════════════════════════════════════════════════════════

export function BiometricsPanel({ subjectType, subjectId, capturedById }: BiometricsPanelProps) {
    return (
        <Tabs defaultValue="photos">
            <TabsList className="w-full mb-4">
                <TabsTrigger value="photos" className="flex-1 gap-1.5 text-xs">
                    <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                    Photos
                </TabsTrigger>
                <TabsTrigger value="fingerprints" className="flex-1 gap-1.5 text-xs">
                    <HugeiconsIcon icon={FingerPrintIcon} className="size-3.5" />
                    Fingerprints
                </TabsTrigger>
            </TabsList>

            <TabsContent value="photos">
                <PhotoSection subjectType={subjectType} subjectId={subjectId} capturedById={capturedById} />
            </TabsContent>
            <TabsContent value="fingerprints">
                <FingerprintSection subjectType={subjectType} subjectId={subjectId} capturedById={capturedById} />
            </TabsContent>
        </Tabs>
    )
}