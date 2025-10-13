import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

interface CategoryCardProps {
  categoryId: number
  categoryName: string
  totalAmountCAD: string
  totalAmountUSD: string
}

export function CategoryCard({ 
  categoryId, 
  categoryName, 
  totalAmountCAD, 
  totalAmountUSD 
}: CategoryCardProps) {
  return (
    <Card key={categoryId} className="px-0 py-3 gap-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{categoryName}</CardTitle>
      </CardHeader>
      <CardContent> 
        <p className="font-medium">{totalAmountCAD} CAD</p>
        <p className="font-small text-muted-foreground">{totalAmountUSD} USD</p>
      </CardContent>
    </Card>
  )
} 