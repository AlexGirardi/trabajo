import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	List,
	ListItem,
	ListItemText,
	Chip,
	Box,
	Typography,
	IconButton,
	Tooltip,
	Divider,
} from '@mui/material';
import { Close, PlayArrow, Quiz, Schedule } from '@mui/icons-material';
import type { Course, Exam } from '../../types';
import { examService } from '../../services/examService';
import { useHybridResource } from '../../hooks/useHybridResource';
import { useNavigate } from 'react-router-dom';

interface CourseExamListProps {
	open: boolean;
	curso: Course | null;
	onClose: () => void;
}

export const CourseExamList: React.FC<CourseExamListProps> = ({ open, curso, onClose }) => {
	const { data: allExams, loading, error } = useHybridResource<Exam[]>({
		fetcher: () => examService.fetchExams?.(),
		local: () => examService.getExams(),
		deps: [open]
	});
	const [exams, setExams] = useState<Exam[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (open && curso) {
			setExams(allExams.filter(e => e.cursoId === curso.id));
		} else {
			setExams([]);
		}
	}, [open, curso, allExams]);

	const formatDate = (date: Date | string) => {
		const d = date instanceof Date ? date : new Date(date);
		return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
	};

	const truncateDescription = (description: string | undefined, maxLength: number = 80) => {
		if (!description) return 'Sin descripción';
		if (description.length <= maxLength) return description;
		return description.substring(0, maxLength) + '...';
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Box>
					<Typography variant="h6" fontWeight="bold">Exámenes del Curso</Typography>
					{curso && (
						<Typography variant="body2" color="text.secondary">{curso.nombre}</Typography>
					)}
				</Box>
				<IconButton onClick={onClose}><Close /></IconButton>
			</DialogTitle>
			<DialogContent dividers sx={{ pt: 1 }}>
				{error && (
					<Box sx={{ mb:2 }}><Typography color="error" variant="body2">{error}</Typography></Box>
				)}
				{loading && exams.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 5 }}>
						<Typography variant="body2">Cargando exámenes...</Typography>
					</Box>
				) : exams.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 5 }}>
							<Quiz sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
							<Typography variant="h6" gutterBottom>No hay exámenes para este curso</Typography>
							<Typography variant="body2" color="text.secondary">
								Genera un examen con IA para que aparezca aquí.
							</Typography>
						</Box>
				) : (
					<List>
						{exams.map(exam => (
							<React.Fragment key={exam.id}>
								<ListItem
									secondaryAction={
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Chip size="small" label={`${exam.preguntas.length} preg.`} />
											<Chip size="small" icon={<Schedule sx={{ fontSize: 16 }} />} label={`${exam.duracionMinutos}m`} />
											<Tooltip title="Realizar Examen">
												<IconButton color="primary" onClick={() => navigate(`/take-exam/${exam.id}`)}>
													<PlayArrow />
												</IconButton>
											</Tooltip>
										</Box>
									}
								>
									<ListItemText
										primary={exam.titulo}
										secondary={
											<span>
												{truncateDescription(exam.descripcion, 80)} • {formatDate(exam.fechaCreacion)}
											</span>
										}
									/>
								</ListItem>
								<Divider component="li" />
							</React.Fragment>
						))}
					</List>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cerrar</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CourseExamList;
