import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  header: {
    padding: '20 40',
    marginBottom: 20,
    borderBottom: '1 solid #e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'Times-Roman',
  },
})

interface PDFHeaderProps {
  title: string
  description?: string
}

export function PDFHeader({ title, description }: PDFHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.subtitle}>{description}</Text>}
    </View>
  )
} 