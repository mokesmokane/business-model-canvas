import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { Section, SectionItem, TextSectionItem } from '@/types/canvas'
import { CanvasType } from '@/types/canvas-sections'
import { PDFHeader } from './PDFHeader'

interface CanvasPDFProps {
  sections: Map<string, Section>
  canvasType: CanvasType
  canvasLayout: {
    gridTemplate: {
      columns: string
      rows: string
    }
    areas: string[]
  }
  title: string
  description?: string
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 10,
    fontFamily: 'Times-Roman',
  },
  section: {
    padding: 8,
    border: '1 solid #e5e7eb',
    borderRadius: 4,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Times-Bold',
  },
  sectionContent: {
    fontSize: 10,
    marginBottom: 4,
    fontFamily: 'Times-Roman',
  },
  gridContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gridItem: {
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    height: '85%',
  },
})

function PDFSection({ title, items }: { title: string; items: SectionItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => {
        if(item instanceof TextSectionItem) {
          return (
            <Text key={index} style={styles.sectionContent}>
              • {item.content}
            </Text>
          )
        }
      })}
    </View>
  )
}

function parseGridArea(area: string): { col: number; row: number; width: number; height: number } {
  // Format: "1 / 1 / 3 / 2" (rowStart / colStart / rowEnd / colEnd)
  const [rowStart, colStart, rowEnd, colEnd] = area.split('/').map(num => parseInt(num.trim()))
  return {
    col: colStart - 1,
    row: rowStart - 1,
    width: colEnd - colStart,
    height: rowEnd - rowStart,
  }
}

export function CanvasPDF({ sections, canvasType, canvasLayout, title, description }: CanvasPDFProps) {
  const sortedSections = Array.from(sections.entries())
    .map(([key, section]) => ({
      key,
      section,
      config: canvasType.sections.find(s => s.name === key)
    }))
    .sort((a, b) => (a.section.gridIndex || 0) - (b.section.gridIndex || 0))

  // Adjust grid dimensions calculation
  const gridColumns = canvasLayout.gridTemplate.columns.split(' ').length
  const gridRows = 3
  const columnWidth = (100 - 10) / gridColumns // Reduced margin to 10%
  const rowHeight = 85 / gridRows // Adjusted to account for header

  return (
    <Document>
      <Page size="A3" orientation="landscape" style={styles.page}>
        <PDFHeader title={title} description={description} />
        <View style={[styles.contentContainer, { padding: '2%' }]}>
          {sortedSections.map((item, index) => {
            const area = parseGridArea(canvasLayout.areas[index])
            
            const style = {
              ...styles.gridItem,
              left: `${5 + (area.col * columnWidth)}%`,
              top: `${5 + (area.row * rowHeight)}%`,
              width: `${area.width * columnWidth - 2}%`,
              height: `${area.height * rowHeight - 2}%`,
              padding: 2,
            }

            return (
              <View key={item.key} style={style}>
                <PDFSection
                  title={item.config?.name || ''}
                  items={item.section.sectionItems}
                />
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
} 